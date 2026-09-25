import { screenNodeTypes } from '@/enums'
import type { TNode, TStudioData } from '@/types'
import type { TMediaKind, TPickedFile, TPlatform, TStoreApi, TStoreNotice } from '@/platform/types'

const storageKeys = {
  studio: 'livetr:studio',
  nodebar: 'livetr:nodebar',
  sceneThumbnail: (sceneId: string) => `livetr:scene:${sceneId}`,
}

const acceptTypes: Record<TMediaKind, string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
}

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch (_error) {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn(`[web store] ${key} could not be saved`, error)
  }
}

function createDefaultStudio(): TStudioData {
  return { scene: [{ sceneId: window.crypto.randomUUID(), nodes: [] }] }
}

/** Web ortamında örnek medyalar geliştirme sunucusunun servis ettiği `store/nodebar` klasöründen okunur. */
function createDefaultNodebar(): TNode[] {
  const node = (type: TNode['type'], style: TNode['style'], data: TNode['data']): TNode => ({
    id: window.crypto.randomUUID(),
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
      { title: 'Klasik Resim', src: 'store/nodebar/test-image.png' }
    ),
    node(
      screenNodeTypes.video,
      { width: '150px', height: '150px' },
      { title: 'Test Video', src: 'store/nodebar/bigbuckbunny.mp4' }
    ),
    node(
      screenNodeTypes.background,
      { width: '100%', height: '100%' },
      { title: 'Arka Plan', src: 'store/nodebar/test-bg-image.jpg' }
    ),
    node(screenNodeTypes.backgroundSound, {}, { title: 'Arka Plan Test Sesi', src: 'store/nodebar/test-audio.mp3' }),
  ]
}

function parse<T>(key: string, validate: (value: any) => boolean, notices: TStoreNotice[], notice: TStoreNotice) {
  const content = read(key)
  if (content == null) {
    return null
  }

  try {
    const value = JSON.parse(content)
    if (validate(value)) {
      return value as T
    }
  } catch (_error) {}

  notices.push(notice)
  return null
}

function pickWithInput(kind: TMediaKind) {
  return new Promise<TPickedFile[]>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = acceptTypes[kind]
    input.addEventListener(
      'change',
      () =>
        resolve(Array.from(input.files ?? []).map((file) => ({ name: file.name, path: URL.createObjectURL(file) }))),
      { once: true }
    )
    input.addEventListener('cancel', () => resolve([]), { once: true })
    input.click()
  })
}

/**
 * Tarayıcıda (web) çalışırken kullanılan platform.
 * Veriler localStorage'da tutulur; seçilen dosyalar sadece oturum boyunca geçerlidir.
 * Canlı yayın (ffmpeg) ve pencere/ekran listesi masaüstüne özeldir.
 */
export function createWebPlatform(): TPlatform {
  const store: TStoreApi = {
    async load() {
      const notices: TStoreNotice[] = []
      const studio =
        parse<TStudioData>(
          storageKeys.studio,
          (value) => Array.isArray(value?.scene) && value.scene.length > 0,
          notices,
          'studio_reset'
        ) ?? createDefaultStudio()
      const nodebar =
        parse<TNode[]>(storageKeys.nodebar, (value) => Array.isArray(value), notices, 'nodebar_reset') ??
        createDefaultNodebar()

      write(storageKeys.studio, JSON.stringify(studio))
      write(storageKeys.nodebar, JSON.stringify(nodebar))

      return { studio, nodebar, notices }
    },
    async saveStudio(content) {
      write(storageKeys.studio, content)
    },
    async saveNodebar(content) {
      write(storageKeys.nodebar, content)
    },
    async saveSceneThumbnail(sceneId, bytes) {
      const blob = new Blob([bytes], { type: 'image/png' })
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
      write(storageKeys.sceneThumbnail(sceneId), dataUrl)
    },
    async readSceneThumbnail(sceneId) {
      return read(storageKeys.sceneThumbnail(sceneId))
    },
    async removeSceneThumbnail(sceneId) {
      try {
        localStorage.removeItem(storageKeys.sceneThumbnail(sceneId))
      } catch (_error) {}
    },
  }

  return {
    isDesktop: false,
    store,
    stream: null,
    pickMedia: pickWithInput,
    getDesktopSources: async () => [],
    setLocale: () => {},
    toMediaUrl: (src) => src,
  }
}
