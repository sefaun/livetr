const { ipcMain, dialog, desktopCapturer, BrowserWindow } = require('electron')
const path = require('node:path')

const mediaFilters = {
  image: { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] },
  video: { name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v'] },
  audio: { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'oga', 'aac', 'm4a', 'flac', 'opus', 'webm'] },
}

/**
 * Renderer ile ana süreç arasındaki tüm IPC kanalları burada tanımlanır.
 * Sadece ana pencereden gelen istekler kabul edilir.
 */
function registerIpcHandlers({ getMainWindow, store, stream, setLocale }) {
  function isTrusted(event) {
    const window = getMainWindow()
    return !!window && !window.isDestroyed() && event.sender == window.webContents
  }

  function handle(channel, listener) {
    ipcMain.handle(channel, (event, ...args) => {
      if (!isTrusted(event)) {
        throw new Error('Untrusted IPC sender')
      }

      return listener(event, ...args)
    })
  }

  function on(channel, listener) {
    ipcMain.on(channel, (event, ...args) => {
      if (isTrusted(event)) {
        listener(event, ...args)
      }
    })
  }

  handle('store:load', () => store.load())
  handle('store:save-studio', (_event, content) => store.saveStudio(content))
  handle('store:save-nodebar', (_event, content) => store.saveNodebar(content))
  handle('store:save-scene-thumbnail', (_event, sceneId, bytes) => store.saveSceneThumbnail(sceneId, bytes))
  handle('store:read-scene-thumbnail', (_event, sceneId) => store.readSceneThumbnail(sceneId))
  handle('store:remove-scene-thumbnail', (_event, sceneId) => store.removeSceneThumbnail(sceneId))

  handle('dialog:open-media', async (event, kind) => {
    const filter = mediaFilters[kind]
    if (!filter) {
      throw new Error(`Unknown media type: ${kind}`)
    }

    const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
      properties: ['openFile', 'multiSelections'],
      filters: [filter],
    })

    if (result.canceled) {
      return []
    }

    return result.filePaths.map((filePath) => ({ path: filePath, name: path.basename(filePath) }))
  })

  handle('media:desktop-sources', async () => {
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

  on('app:set-locale', (_event, locale) => setLocale(locale))
}

module.exports = { registerIpcHandlers }
