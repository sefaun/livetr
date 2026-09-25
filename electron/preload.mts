import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  TDesktopApi,
  TEventChannel,
  TEventChannels,
  TInvokeArgs,
  TInvokeChannel,
  TInvokeResult,
  TSendChannel,
  TSendChannels,
} from '../shared/ipc.js'

/**
 * Renderer'a açılan masaüstü API'si (window.livetr).
 * Renderer'da Node.js erişimi yoktur; dosya, diyalog, ekran yakalama ve ffmpeg işlemleri bu köprü üzerinden
 * ana süreçte yapılır. Kanallar ve tipler shared/ipc.ts sözleşmesinden gelir.
 *
 * Not: Pencere sandbox içinde çalıştığı için bu dosya CommonJS (preload.cjs) olarak derlenir.
 */

function invoke<K extends TInvokeChannel>(channel: K, ...args: TInvokeArgs<K>): Promise<TInvokeResult<K>> {
  return ipcRenderer.invoke(channel, ...args)
}

function send<K extends TSendChannel>(channel: K, ...args: TSendChannels[K]): void {
  ipcRenderer.send(channel, ...args)
}

function subscribe<K extends TEventChannel>(channel: K, listener: (...args: TEventChannels[K]) => void): () => void {
  const handler = (_event: IpcRendererEvent, ...args: unknown[]) => listener(...(args as TEventChannels[K]))
  ipcRenderer.on(channel, handler)
  return () => {
    ipcRenderer.removeListener(channel, handler)
  }
}

const api: TDesktopApi = {
  platform: process.platform,
  store: {
    load: () => invoke('store:load'),
    saveStudio: (content) => invoke('store:save-studio', content),
    saveNodebar: (content) => invoke('store:save-nodebar', content),
    saveSceneThumbnail: (sceneId, bytes) => invoke('store:save-scene-thumbnail', sceneId, bytes),
    readSceneThumbnail: (sceneId) => invoke('store:read-scene-thumbnail', sceneId),
    removeSceneThumbnail: (sceneId) => invoke('store:remove-scene-thumbnail', sceneId),
  },
  dialog: {
    openMedia: (kind) => invoke('dialog:open-media', kind),
  },
  media: {
    getDesktopSources: () => invoke('media:desktop-sources'),
  },
  stream: {
    start: (config) => invoke('stream:start', config),
    stop: () => invoke('stream:stop'),
    write: (chunk) => send('stream:write', chunk),
    onEvent: (listener) => subscribe('stream:event', listener),
  },
  app: {
    setLocale: (locale) => send('app:set-locale', locale),
  },
}

contextBridge.exposeInMainWorld('livetr', api)
