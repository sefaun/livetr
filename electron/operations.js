const { ipcMain, desktopCapturer, dialog } = require('electron')

/**
 * Front-end ile ilgili işlemler yapılır.
 */
function operations() {
  ipcMain.handle('getMediaSources', (_event) => desktopCapturer.getSources({ types: ['window', 'screen'] }))

  ipcMain.handle('selectImage', (_event) =>
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
    })
  )

  ipcMain.handle('selectVideo', (_event) =>
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg'] }],
    })
  )
}

module.exports = operations
