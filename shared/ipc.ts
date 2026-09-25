/**
 * Renderer ile Electron ana süreci arasındaki IPC sözleşmesi.
 * Kanal adları, argümanları ve dönüş tipleri tek yerde tanımlanır; ana süreç (ipcMain), preload (ipcRenderer)
 * ve renderer aynı tipleri kullandığı için sözleşme dışı bir çağrı derleme zamanında hata verir.
 */
import type { TNode, TStudioData } from './model.js'

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
  /** kbps */
  videoBitrate: number
  /** kbps */
  audioBitrate: number
  record: boolean
}

export type TStreamStartResult = {
  recordPath: string | null
}

export type TStreamState = 'idle' | 'starting' | 'live' | 'stopping'

export type TStreamStats = {
  frame: number
  /** Son saniyelerdeki gerçek kare hızı. */
  fps: number
  /** kbps; yerel kayıt açıkken ffmpeg raporlamaz (0). */
  bitrate: number
  totalSize: number
  outTimeMs: number
  dupFrames: number
  dropFrames: number
  speed: number
  ended: boolean
  bufferedBytes: number
  bufferedSeconds: number
  liveSince: number
}

export type TStreamWarning = 'congested' | 'recovered'

export type TStreamEndedEvent = {
  type: 'ended'
  reason: 'stopped' | 'error'
  message?: string
  details?: string
  recordPath?: string | null
}

export type TStreamEvent =
  | { type: 'state'; state: TStreamState }
  | { type: 'stats'; stats: TStreamStats }
  | { type: 'warning'; code: TStreamWarning }
  | TStreamEndedEvent

/** `ipcRenderer.invoke` / `ipcMain.handle` kanalları. */
export type TInvokeChannels = {
  'store:load': { args: []; result: TStoreSnapshot }
  'store:save-studio': { args: [content: string]; result: void }
  'store:save-nodebar': { args: [content: string]; result: void }
  'store:save-scene-thumbnail': { args: [sceneId: string, bytes: ArrayBuffer]; result: void }
  'store:read-scene-thumbnail': { args: [sceneId: string]; result: string | null }
  'store:remove-scene-thumbnail': { args: [sceneId: string]; result: void }
  'dialog:open-media': { args: [kind: TMediaKind]; result: TPickedFile[] }
  'media:desktop-sources': { args: []; result: TDesktopSource[] }
  'stream:start': { args: [config: TStreamConfig]; result: TStreamStartResult }
  'stream:stop': { args: []; result: void }
}

/** `ipcRenderer.send` / `ipcMain.on` kanalları (cevap beklenmez). */
export type TSendChannels = {
  'stream:write': [chunk: ArrayBuffer]
  'app:set-locale': [locale: string]
}

/** Ana süreçten renderer'a (`webContents.send`) gönderilen olaylar. */
export type TEventChannels = {
  'stream:event': [event: TStreamEvent]
}

export type TInvokeChannel = keyof TInvokeChannels
export type TInvokeArgs<K extends TInvokeChannel> = TInvokeChannels[K]['args']
export type TInvokeResult<K extends TInvokeChannel> = TInvokeChannels[K]['result']
export type TSendChannel = keyof TSendChannels
export type TEventChannel = keyof TEventChannels

/**
 * Preload betiğinin `window.livetr` olarak açtığı masaüstü API'si.
 */
export type TDesktopApi = {
  platform: string
  store: {
    load(): Promise<TStoreSnapshot>
    saveStudio(content: string): Promise<void>
    saveNodebar(content: string): Promise<void>
    saveSceneThumbnail(sceneId: string, bytes: ArrayBuffer): Promise<void>
    readSceneThumbnail(sceneId: string): Promise<string | null>
    removeSceneThumbnail(sceneId: string): Promise<void>
  }
  dialog: {
    openMedia(kind: TMediaKind): Promise<TPickedFile[]>
  }
  media: {
    getDesktopSources(): Promise<TDesktopSource[]>
  }
  stream: {
    start(config: TStreamConfig): Promise<TStreamStartResult>
    stop(): Promise<void>
    write(chunk: ArrayBuffer): void
    onEvent(listener: (event: TStreamEvent) => void): () => void
  }
  app: {
    setLocale(locale: string): void
  }
}
