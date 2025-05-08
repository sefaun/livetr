const { ipcMain, desktopCapturer } = require('electron')

/**
 * Front-end ile ilgili işlemler yapılır.
 */
function operations() {
  ipcMain.handle('getMediaSources', async (_event) => await desktopCapturer.getSources({ types: ['window', 'screen'] }))
}

module.exports = operations
