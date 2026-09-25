import type { TNode, TStudioData } from '@/types'

export type TMediaKind = 'image' | 'video' | 'audio'

export type TPickedFile = {
  name: string
  path: string
}

export type TDesktopSource = {
  id: string
  name: string
  thumbnail: string
  aspectRatio: number
}

export type TStoreNotice = 'studio_reset' | 'nodebar_reset'

export type TStoreSnapshot = {
  studio: TStudioData
  nodebar: TNode[]
  notices: TStoreNotice[]
}

export type TStreamConfig = {
  url: string
  width: number
  height: number
  fps: number
  videoBitrate: number
  audioBitrate: number
  record: boolean
}

export type TStreamState = 'idle' | 'starting' | 'live' | 'stopping'

export type TStreamStats = {
  frame: number
  fps: number
  bitrate: number
  totalSize: number
  outTimeMs: number
  dupFrames: number
  dropFrames: number
  speed: number
  bufferedBytes: number
  bufferedSeconds: number
  liveSince: number
}

export type TStreamEvent =
  | { type: 'state'; state: TStreamState }
  | { type: 'stats'; stats: TStreamStats }
  | { type: 'warning'; code: 'congested' | 'recovered' }
  | {
      type: 'ended'
      reason: 'stopped' | 'error'
      message?: string
      details?: string
      recordPath?: string | null
    }

export type TStoreApi = {
  load(): Promise<TStoreSnapshot>
  saveStudio(content: string): Promise<void>
  saveNodebar(content: string): Promise<void>
  saveSceneThumbnail(sceneId: string, bytes: ArrayBuffer): Promise<void>
  readSceneThumbnail(sceneId: string): Promise<string | null>
  removeSceneThumbnail(sceneId: string): Promise<void>
}

export type TStreamApi = {
  start(config: TStreamConfig): Promise<{ recordPath: string | null }>
  stop(): Promise<void>
  write(chunk: ArrayBuffer): void
  onEvent(listener: (event: TStreamEvent) => void): () => void
}

/**
 * Electron preload betiğinin (electron/preload.cjs) `window.livetr` olarak açtığı API.
 */
export type TDesktopApi = {
  platform: string
  store: TStoreApi
  dialog: {
    openMedia(kind: TMediaKind): Promise<TPickedFile[]>
  }
  media: {
    getDesktopSources(): Promise<TDesktopSource[]>
  }
  stream: TStreamApi
  app: {
    setLocale(locale: string): void
  }
}

/**
 * Uygulamanın çalıştığı ortamın (masaüstü veya tarayıcı) ortak arayüzü.
 * Bileşenler Electron/Node API'lerine doğrudan değil, bu arayüz üzerinden erişir.
 */
export type TPlatform = {
  isDesktop: boolean
  store: TStoreApi
  /** Canlı yayın sadece masaüstünde (ffmpeg) mümkündür; web ortamında `null`. */
  stream: TStreamApi | null
  pickMedia(kind: TMediaKind): Promise<TPickedFile[]>
  getDesktopSources(): Promise<TDesktopSource[]>
  setLocale(locale: string): void
  /** Kayıtlı medya yolunu (dosya yolu veya URL) `<img>`/`<video>` için kullanılabilir URL'ye çevirir. */
  toMediaUrl(src: string): string
}
