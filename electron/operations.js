const { ipcMain, desktopCapturer } = require('electron/main')

/**
 * Front-end ile ilgili işlemler yapılır.
 * @param {win: BrowserWindow} opts
 */
function operations(win) {
  ipcMain.handle('getMediaSources', async (_event) => await desktopCapturer.getSources({ types: ['window', 'screen'] }))
}

module.exports = operations
