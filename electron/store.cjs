const fsp = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')

/** Uygulamayla birlikte gelen örnek medyalar (store/nodebar). */
const sampleFiles = {
  image: 'test-image.png',
  video: 'bigbuckbunny.mp4',
  background: 'test-bg-image.jpg',
  audio: 'test-audio.mp3',
}

const MAX_THUMBNAIL_BYTES = 8 * 1024 * 1024
const sceneIdPattern = /^[\w-]{1,128}$/

/**
 * Stüdyo verilerini (sahneler, node bar öğeleri, sahne küçük resimleri) diskte tutar.
 * Yazmalar dosya başına sıraya alınır ve atomik yapılır (önce geçici dosya, sonra rename);
 * böylece uygulama yazma sırasında kapanırsa JSON dosyaları bozulmaz.
 */
function createStore({ dataDir, bundledStoreDir, legacyDirs = [], log = console }) {
  const paths = {
    root: dataDir,
    scene: path.join(dataDir, 'scene'),
    nodebar: path.join(dataDir, 'nodebar'),
    studioJson: path.join(dataDir, 'studio.json'),
    nodebarJson: path.join(dataDir, 'nodebar.json'),
  }
  const queues = new Map()
  let initialized = null

  function enqueue(key, task) {
    const previous = queues.get(key) ?? Promise.resolve()
    const next = previous.catch(() => {}).then(task)
    queues.set(key, next)
    next.finally(() => queues.get(key) == next && queues.delete(key)).catch(() => {})
    return next
  }

  async function writeFileAtomic(file, content) {
    const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`
    await fsp.writeFile(temp, content)

    for (let attempt = 0; ; attempt++) {
      try {
        await fsp.rename(temp, file)
        return
      } catch (error) {
        // Windows'ta hedef dosya kısa süreliğine kilitli olabilir (antivirüs, indeksleme).
        if (attempt < 5 && ['EPERM', 'EACCES', 'EBUSY'].includes(error.code)) {
          await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
          continue
        }

        await fsp.rm(temp, { force: true })
        throw error
      }
    }
  }

  function save(file, content) {
    return enqueue(file, () => writeFileAtomic(file, content))
  }

  async function exists(file) {
    try {
      await fsp.access(file)
      return true
    } catch (_error) {
      return false
    }
  }

  async function copyIfMissing(from, to) {
    if (from == to || (await exists(to)) || !(await exists(from))) {
      return
    }

    await fsp.copyFile(from, to)
  }

  /** Eski sürümlerin çalışma klasöründe tuttuğu verileri yeni veri klasörüne bir kez taşır. */
  async function migrateLegacyData() {
    if (await exists(paths.studioJson)) {
      return
    }

    for (const legacyDir of legacyDirs) {
      if (!legacyDir || path.resolve(legacyDir) == path.resolve(dataDir)) {
        continue
      }

      if (!(await exists(path.join(legacyDir, 'studio.json')))) {
        continue
      }

      log.info?.(`[store] migrating data from ${legacyDir}`)
      await copyIfMissing(path.join(legacyDir, 'studio.json'), paths.studioJson)
      await copyIfMissing(path.join(legacyDir, 'nodebar.json'), paths.nodebarJson)

      const legacySceneDir = path.join(legacyDir, 'scene')
      if (await exists(legacySceneDir)) {
        for (const file of await fsp.readdir(legacySceneDir)) {
          if (file.endsWith('.png')) {
            await copyIfMissing(path.join(legacySceneDir, file), path.join(paths.scene, file))
          }
        }
      }
      return
    }
  }

  function init() {
    initialized ??= (async () => {
      await fsp.mkdir(paths.scene, { recursive: true })
      await fsp.mkdir(paths.nodebar, { recursive: true })

      try {
        await migrateLegacyData()
      } catch (error) {
        log.error?.('[store] legacy migration failed', error)
      }
    })()

    return initialized
  }

  function samplePath(name) {
    return path.join(paths.nodebar, name)
  }

  async function ensureSampleMedia() {
    for (const name of Object.values(sampleFiles)) {
      try {
        await copyIfMissing(path.join(bundledStoreDir, 'nodebar', name), samplePath(name))
      } catch (error) {
        log.warn?.(`[store] sample media could not be copied: ${name}`, error)
      }
    }
  }

  function createDefaultStudio() {
    return {
      scene: [{ sceneId: crypto.randomUUID(), nodes: [] }],
    }
  }

  function createDefaultNodebar() {
    const node = (type, style, data) => ({ id: crypto.randomUUID(), type, position: { x: 0, y: 0 }, style, data })

    return [
      node(
        'text',
        { width: 'fit-content', height: 'fit-content' },
        { text: 'Test - 1 😊', style: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Arial, Helvetica, sans-serif' } }
      ),
      node('image', { width: '150px', height: '150px' }, { title: 'Klasik Resim', src: samplePath(sampleFiles.image) }),
      node('video', { width: '150px', height: '150px' }, { title: 'Test Video', src: samplePath(sampleFiles.video) }),
      node(
        'background',
        { width: '100%', height: '100%' },
        { title: 'Arka Plan', src: samplePath(sampleFiles.background) }
      ),
      node('backgroundSound', {}, { title: 'Arka Plan Test Sesi', src: samplePath(sampleFiles.audio) }),
    ]
  }

  function isNode(value) {
    return (
      !!value &&
      typeof value == 'object' &&
      typeof value.id == 'string' &&
      typeof value.type == 'string' &&
      !!value.position &&
      Number.isFinite(value.position.x) &&
      Number.isFinite(value.position.y) &&
      !!value.data &&
      typeof value.data == 'object'
    )
  }

  function normalizeNode(value) {
    return { ...value, style: value.style && typeof value.style == 'object' ? value.style : {} }
  }

  function parseStudio(content) {
    const data = JSON.parse(content)
    if (!data || !Array.isArray(data.scene) || !data.scene.length) {
      throw new Error('Invalid studio data')
    }

    const scene = data.scene
      .filter((item) => item && typeof item.sceneId == 'string' && Array.isArray(item.nodes))
      .map((item) => ({ ...item, nodes: item.nodes.filter(isNode).map(normalizeNode) }))

    if (!scene.length) {
      throw new Error('Invalid studio data')
    }

    return { ...data, scene }
  }

  function parseNodebar(content) {
    const data = JSON.parse(content)
    if (!Array.isArray(data)) {
      throw new Error('Invalid node bar data')
    }

    return data.filter(isNode).map(normalizeNode)
  }

  /**
   * JSON dosyasını okur. Dosya yoksa varsayılan içerik oluşturulur;
   * bozuksa yedeği alınıp varsayılan içerik yüklenir ve `notices` listesine bilgi eklenir.
   */
  async function readJson(file, parse, createDefault, notices, noticeKey) {
    let content = null
    try {
      content = await fsp.readFile(file, 'utf8')
    } catch (error) {
      if (error.code != 'ENOENT') {
        throw error
      }
    }

    if (content != null) {
      try {
        return parse(content)
      } catch (error) {
        const backup = `${file}.corrupt-${Date.now()}`
        log.warn?.(`[store] ${path.basename(file)} is invalid, a backup was saved as ${backup}`, error)
        await fsp.rename(file, backup).catch(() => {})
        notices.push(noticeKey)
      }
    }

    const data = await createDefault()
    await save(file, JSON.stringify(data, null, 2))
    return data
  }

  async function load() {
    await init()
    const notices = []

    const studio = await readJson(paths.studioJson, parseStudio, createDefaultStudio, notices, 'studio_reset')
    const nodebar = await readJson(
      paths.nodebarJson,
      parseNodebar,
      async () => {
        await ensureSampleMedia()
        return createDefaultNodebar()
      },
      notices,
      'nodebar_reset'
    )

    return { studio, nodebar, notices }
  }

  async function saveStudio(content) {
    await init()
    const data = parseStudio(String(content))
    await save(paths.studioJson, JSON.stringify(data, null, 2))
  }

  async function saveNodebar(content) {
    await init()
    const data = parseNodebar(String(content))
    await save(paths.nodebarJson, JSON.stringify(data, null, 2))
  }

  function scenePath(sceneId) {
    if (typeof sceneId != 'string' || !sceneIdPattern.test(sceneId)) {
      throw new Error('Invalid scene id')
    }

    return path.join(paths.scene, `${sceneId}.png`)
  }

  async function saveSceneThumbnail(sceneId, bytes) {
    await init()
    const file = scenePath(sceneId)
    const buffer = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes)
    if (!buffer.length || buffer.length > MAX_THUMBNAIL_BYTES) {
      throw new Error('Invalid thumbnail')
    }

    await save(file, buffer)
  }

  async function readSceneThumbnail(sceneId) {
    await init()
    const file = scenePath(sceneId)
    try {
      return `data:image/png;base64,${(await fsp.readFile(file)).toString('base64')}`
    } catch (_error) {
      return null
    }
  }

  async function removeSceneThumbnail(sceneId) {
    await init()
    const file = scenePath(sceneId)
    await enqueue(file, () => fsp.rm(file, { force: true }))
  }

  /** Bekleyen tüm yazmaların bitmesini bekler (uygulama kapanırken). */
  async function flush() {
    await Promise.allSettled([...queues.values()])
  }

  return {
    paths,
    init,
    load,
    saveStudio,
    saveNodebar,
    saveSceneThumbnail,
    readSceneThumbnail,
    removeSceneThumbnail,
    flush,
  }
}

module.exports = { createStore, sampleFiles }
