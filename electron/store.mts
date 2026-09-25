import crypto from 'node:crypto'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { isScreenNodeType, screenNodeTypes } from '../shared/model.js'
import type { TNode, TNodeStyle, TScene, TScreenNodeTypes, TStudioData } from '../shared/model.js'
import type { TStoreNotice, TStoreSnapshot } from '../shared/ipc.js'
import type { TLogger } from './stream.mjs'

export const sampleFiles = {
  image: 'test-image.png',
  video: 'bigbuckbunny.mp4',
  background: 'test-bg-image.jpg',
  audio: 'test-audio.mp3',
} as const

const MAX_THUMBNAIL_BYTES = 8 * 1024 * 1024
const sceneIdPattern = /^[\w-]{1,128}$/

type TStoreOptions = {
  dataDir: string
  bundledStoreDir: string
  legacyDirs?: readonly string[]
  log?: TLogger
}

export type TStore = ReturnType<typeof createStore>

function errorCode(error: unknown): string | undefined {
  return error instanceof Error && 'code' in error && typeof error.code == 'string' ? error.code : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value == 'object' && value != null && !Array.isArray(value)
}

function toNodeStyle(value: unknown): TNodeStyle {
  const style: TNodeStyle = {}
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (typeof item == 'string') {
        style[key] = item
      }
    }
  }

  return style
}

function toNodeData(type: TScreenNodeTypes, value: Record<string, unknown>): TNode['data'] | null {
  switch (type) {
    case screenNodeTypes.text: {
      const style = value.style
      if (typeof value.text != 'string' || !isRecord(style)) {
        return null
      }

      return {
        text: value.text,
        style: {
          fontSize: Number(style.fontSize) || 24,
          fontFamily: typeof style.fontFamily == 'string' ? style.fontFamily : 'Arial, Helvetica, sans-serif',
          color: typeof style.color == 'string' ? style.color : '#FFFFFF',
        },
      }
    }

    case screenNodeTypes.sourceMedia:
    case screenNodeTypes.liveCamera:
      return typeof value.id == 'string' ? { id: value.id, title: String(value.title ?? '') } : null

    case screenNodeTypes.image:
    case screenNodeTypes.video:
    case screenNodeTypes.background:
    case screenNodeTypes.backgroundSound:
      return typeof value.src == 'string' ? { title: String(value.title ?? ''), src: value.src } : null
  }
}

/** Geçersiz öğeler atlanır; tek bir bozuk kayıt tüm sahnenin yüklenmesini engellemez. */
function toNode(value: unknown): TNode | null {
  if (!isRecord(value) || typeof value.id != 'string' || !isScreenNodeType(value.type)) {
    return null
  }

  const position = value.position
  if (!isRecord(position) || !Number.isFinite(position.x) || !Number.isFinite(position.y) || !isRecord(value.data)) {
    return null
  }

  const data = toNodeData(value.type, value.data)
  if (!data) {
    return null
  }

  return {
    id: value.id,
    type: value.type,
    position: { x: Number(position.x), y: Number(position.y) },
    style: toNodeStyle(value.style),
    data,
  }
}

function toNodes(value: unknown): TNode[] {
  return Array.isArray(value) ? value.map(toNode).filter((node): node is TNode => node != null) : []
}

export function parseStudio(content: string): TStudioData {
  const data: unknown = JSON.parse(content)
  if (!isRecord(data) || !Array.isArray(data.scene)) {
    throw new Error('Invalid studio data')
  }

  const scene: TScene[] = data.scene
    .filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.sceneId == 'string')
    .map((item) => ({ sceneId: String(item.sceneId), nodes: toNodes(item.nodes) }))

  if (!scene.length) {
    throw new Error('Invalid studio data')
  }

  return { scene }
}

export function parseNodebar(content: string): TNode[] {
  const data: unknown = JSON.parse(content)
  if (!Array.isArray(data)) {
    throw new Error('Invalid node bar data')
  }

  return toNodes(data)
}

export function createStore({ dataDir, bundledStoreDir, legacyDirs = [], log = console }: TStoreOptions) {
  const paths = {
    root: dataDir,
    scene: path.join(dataDir, 'scene'),
    nodebar: path.join(dataDir, 'nodebar'),
    studioJson: path.join(dataDir, 'studio.json'),
    nodebarJson: path.join(dataDir, 'nodebar.json'),
  } as const
  const queues = new Map<string, Promise<void>>()
  let initialized: Promise<void> | null = null

  function enqueue(key: string, task: () => Promise<void>): Promise<void> {
    const previous = queues.get(key) ?? Promise.resolve()
    const next = previous.catch(() => {}).then(task)
    queues.set(key, next)
    next
      .finally(() => {
        if (queues.get(key) == next) {
          queues.delete(key)
        }
      })
      .catch(() => {})
    return next
  }

  async function writeFileAtomic(file: string, content: string | Buffer): Promise<void> {
    const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`
    await fsp.writeFile(temp, content)

    for (let attempt = 0; ; attempt++) {
      try {
        await fsp.rename(temp, file)
        return
      } catch (error) {
        // Windows'ta hedef dosya kısa süreliğine kilitli olabilir (antivirüs, indeksleme).
        const code = errorCode(error)
        if (attempt < 5 && (code == 'EPERM' || code == 'EACCES' || code == 'EBUSY')) {
          await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
          continue
        }

        await fsp.rm(temp, { force: true })
        throw error
      }
    }
  }

  function save(file: string, content: string | Buffer): Promise<void> {
    return enqueue(file, () => writeFileAtomic(file, content))
  }

  async function exists(file: string): Promise<boolean> {
    try {
      await fsp.access(file)
      return true
    } catch (_error) {
      return false
    }
  }

  async function copyIfMissing(from: string, to: string): Promise<void> {
    if (from == to || (await exists(to)) || !(await exists(from))) {
      return
    }

    await fsp.copyFile(from, to)
  }

  async function migrateLegacyData(): Promise<void> {
    if (await exists(paths.studioJson)) {
      return
    }

    for (const legacyDir of legacyDirs) {
      if (path.resolve(legacyDir) == path.resolve(dataDir) || !(await exists(path.join(legacyDir, 'studio.json')))) {
        continue
      }

      log.info(`[store] migrating data from ${legacyDir}`)
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

  function init(): Promise<void> {
    initialized ??= (async () => {
      await fsp.mkdir(paths.scene, { recursive: true })
      await fsp.mkdir(paths.nodebar, { recursive: true })

      try {
        await migrateLegacyData()
      } catch (error) {
        log.error('[store] legacy migration failed', error)
      }
    })()

    return initialized
  }

  function samplePath(name: string): string {
    return path.join(paths.nodebar, name)
  }

  async function ensureSampleMedia(): Promise<void> {
    for (const name of Object.values(sampleFiles)) {
      try {
        await copyIfMissing(path.join(bundledStoreDir, 'nodebar', name), samplePath(name))
      } catch (error) {
        log.warn(`[store] sample media could not be copied: ${name}`, error)
      }
    }
  }

  function createDefaultStudio(): TStudioData {
    return {
      scene: [{ sceneId: crypto.randomUUID(), nodes: [] }],
    }
  }

  function createDefaultNodebar(): TNode[] {
    const node = (type: TScreenNodeTypes, style: TNodeStyle, data: TNode['data']): TNode => ({
      id: crypto.randomUUID(),
      type,
      position: { x: 0, y: 0 },
      style,
      data,
    })

    return [
      node(
        screenNodeTypes.text,
        { width: 'fit-content', height: 'fit-content' },
        { text: 'Test - 1 😊', style: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Arial, Helvetica, sans-serif' } }
      ),
      node(
        screenNodeTypes.image,
        { width: '150px', height: '150px' },
        { title: 'Klasik Resim', src: samplePath(sampleFiles.image) }
      ),
      node(
        screenNodeTypes.video,
        { width: '150px', height: '150px' },
        { title: 'Test Video', src: samplePath(sampleFiles.video) }
      ),
      node(
        screenNodeTypes.background,
        { width: '100%', height: '100%' },
        { title: 'Arka Plan', src: samplePath(sampleFiles.background) }
      ),
      node(screenNodeTypes.backgroundSound, {}, { title: 'Arka Plan Test Sesi', src: samplePath(sampleFiles.audio) }),
    ]
  }

  async function readJson<T>(
    file: string,
    parse: (content: string) => T,
    createDefault: () => T | Promise<T>,
    notices: TStoreNotice[],
    noticeKey: TStoreNotice
  ): Promise<T> {
    let content: string | null = null
    try {
      content = await fsp.readFile(file, 'utf8')
    } catch (error) {
      if (errorCode(error) != 'ENOENT') {
        throw error
      }
    }

    if (content != null) {
      try {
        return parse(content)
      } catch (error) {
        const backup = `${file}.corrupt-${Date.now()}`
        log.warn(`[store] ${path.basename(file)} is invalid, a backup was saved as ${backup}`, error)
        await fsp.rename(file, backup).catch(() => {})
        notices.push(noticeKey)
      }
    }

    const data = await createDefault()
    await save(file, JSON.stringify(data, null, 2))
    return data
  }

  async function load(): Promise<TStoreSnapshot> {
    await init()
    const notices: TStoreNotice[] = []

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

  async function saveStudio(content: unknown): Promise<void> {
    await init()
    await save(paths.studioJson, JSON.stringify(parseStudio(String(content)), null, 2))
  }

  async function saveNodebar(content: unknown): Promise<void> {
    await init()
    await save(paths.nodebarJson, JSON.stringify(parseNodebar(String(content)), null, 2))
  }

  function scenePath(sceneId: unknown): string {
    if (typeof sceneId != 'string' || !sceneIdPattern.test(sceneId)) {
      throw new Error('Invalid scene id')
    }

    return path.join(paths.scene, `${sceneId}.png`)
  }

  async function saveSceneThumbnail(sceneId: unknown, bytes: unknown): Promise<void> {
    await init()
    const file = scenePath(sceneId)
    const buffer =
      bytes instanceof ArrayBuffer
        ? Buffer.from(bytes)
        : ArrayBuffer.isView(bytes)
          ? Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
          : null

    if (!buffer?.length || buffer.length > MAX_THUMBNAIL_BYTES) {
      throw new Error('Invalid thumbnail')
    }

    await save(file, buffer)
  }

  async function readSceneThumbnail(sceneId: unknown): Promise<string | null> {
    await init()
    const file = scenePath(sceneId)
    try {
      return `data:image/png;base64,${(await fsp.readFile(file)).toString('base64')}`
    } catch (_error) {
      return null
    }
  }

  async function removeSceneThumbnail(sceneId: unknown): Promise<void> {
    await init()
    const file = scenePath(sceneId)
    await enqueue(file, () => fsp.rm(file, { force: true }))
  }

  async function flush(): Promise<void> {
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
