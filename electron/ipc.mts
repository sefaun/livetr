import {
  BrowserWindow,
  desktopCapturer,
  dialog,
  ipcMain,
  type FileFilter,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
  type OpenDialogOptions,
} from 'electron'
import path from 'node:path'
import type {
  TDesktopSource,
  TInvokeArgs,
  TInvokeChannel,
  TInvokeResult,
  TMediaKind,
  TPickedFile,
  TSendChannel,
  TSendChannels,
} from '../shared/ipc.js'
import type { TStore } from './store.mjs'
import type { StreamManager } from './stream.mjs'

const mediaFilters: Record<TMediaKind, FileFilter> = {
  image: { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] },
  video: { name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v'] },
  audio: { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'oga', 'aac', 'm4a', 'flac', 'opus', 'webm'] },
}

function isMediaKind(value: unknown): value is TMediaKind {
  return typeof value == 'string' && Object.hasOwn(mediaFilters, value)
}

type TIpcDependencies = {
  getMainWindow: () => BrowserWindow | null
  store: TStore
  stream: StreamManager
  setLocale: (locale: string) => void
}

/**
 * Renderer ile ana süreç arasındaki tüm IPC kanalları burada tanımlanır (sözleşme: shared/ipc.ts).
 * Sadece ana pencereden gelen istekler kabul edilir. Argümanların tipi derleme zamanında sözleşmeden gelir;
 * çalışma zamanında renderer'a güvenilmediği için veriler ayrıca doğrulanır.
 */
export function registerIpcHandlers({ getMainWindow, store, stream, setLocale }: TIpcDependencies): void {
  function isTrusted(event: IpcMainEvent | IpcMainInvokeEvent): boolean {
    const window = getMainWindow()
    return !!window && !window.isDestroyed() && event.sender == window.webContents
  }

  function handle<K extends TInvokeChannel>(
    channel: K,
    listener: (event: IpcMainInvokeEvent, ...args: TInvokeArgs<K>) => TInvokeResult<K> | Promise<TInvokeResult<K>>
  ): void {
    ipcMain.handle(channel, (event, ...args: unknown[]) => {
      if (!isTrusted(event)) {
        throw new Error('Untrusted IPC sender')
      }

      return listener(event, ...(args as TInvokeArgs<K>))
    })
  }

  function on<K extends TSendChannel>(
    channel: K,
    listener: (event: IpcMainEvent, ...args: TSendChannels[K]) => void
  ): void {
    ipcMain.on(channel, (event, ...args: unknown[]) => {
      if (isTrusted(event)) {
        listener(event, ...(args as TSendChannels[K]))
      }
    })
  }

  handle('store:load', () => store.load())
  handle('store:save-studio', (_event, content) => store.saveStudio(content))
  handle('store:save-nodebar', (_event, content) => store.saveNodebar(content))
  handle('store:save-scene-thumbnail', (_event, sceneId, bytes) => store.saveSceneThumbnail(sceneId, bytes))
  handle('store:read-scene-thumbnail', (_event, sceneId) => store.readSceneThumbnail(sceneId))
  handle('store:remove-scene-thumbnail', (_event, sceneId) => store.removeSceneThumbnail(sceneId))

  handle('dialog:open-media', async (event, kind): Promise<TPickedFile[]> => {
    if (!isMediaKind(kind)) {
      throw new Error(`Unknown media type: ${String(kind)}`)
    }

    const options: OpenDialogOptions = {
      properties: ['openFile', 'multiSelections'],
      filters: [mediaFilters[kind]],
    }
    const window = BrowserWindow.fromWebContents(event.sender)
    const result = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options)

    if (result.canceled) {
      return []
    }

    return result.filePaths.map((filePath) => ({ path: filePath, name: path.basename(filePath) }))
  })

  handle('media:desktop-sources', async (): Promise<TDesktopSource[]> => {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 320, height: 180 },
    })

    return sources.map((source) => {
      const empty = source.thumbnail.isEmpty()
      return {
        id: source.id,
        name: source.name,
        thumbnail: empty ? '' : source.thumbnail.toDataURL(),
        aspectRatio: empty ? 16 / 9 : source.thumbnail.getAspectRatio(),
      }
    })
  })

  handle('stream:start', (_event, config) => stream.start(config))
  handle('stream:stop', () => stream.stop())
  on('stream:write', (_event, chunk) => stream.write(chunk))

  on('app:set-locale', (_event, locale) => setLocale(String(locale)))
}
