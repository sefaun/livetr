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
      const files = []

      for (const item of result.filePaths) {
        files.push({
          item: item,
          data: nativeImage.createFromPath(item)
        })
      }

      return files
    }

    return []
  })
}

module.exports = operations
