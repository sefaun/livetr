const { ipcMain, desktopCapturer, dialog, nativeImage } = require('electron')

/**
 * Front-end ile ilgili işlemler yapılır.
 */
function operations() {
  ipcMain.handle('getMediaSources', async (_event) => await desktopCapturer.getSources({ types: ['window', 'screen'] }))

  ipcMain.handle('select-image', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
    })

    if (!result.canceled) {
      return result.filePaths
    }

    return []
  })

  ipcMain.handle('select-video', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg'] }]
    })

    if (!result.canceled) {
      return result.filePaths
    }

    return []
  })
}

module.exports = operations
