const { ipcMain, desktopCapturer, dialog, webContents } = require('electron')

/**
 * Front-end ile ilgili işlemler yapılır.
 */
function operations() {
  ipcMain.handle('getMediaSources', (_event) => desktopCapturer.getSources({ types: ['window', 'screen'] }))

  ipcMain.handle('selectImage', (_event) =>
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
    })
  )

  ipcMain.handle('selectVideo', (_event) =>
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mov'] }],
    })
  )

  ipcMain.handle('selectBackgroundSound', (_event) =>
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'BackgroundSounds', extensions: ['mp3', 'webm', 'ogg', 'wav', 'aac', 'm4a'] }],
    })
  )

  // Webview stream capture for Twitch alerts
  ipcMain.handle('capture-webview-stream', async (_event, { webContentsId, nodeId }) => {
    try {
      const targetWebContents = webContents.fromId(webContentsId)
      
      if (!targetWebContents) {
        return { success: false, error: 'WebContents not found' }
      }

      // Enable audio capture for the webContents
      await targetWebContents.executeJavaScript(`
        // Enable audio and video capture for the alert page
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          }).then(stream => {
            window.__alertStream = stream;
            console.log('Alert stream captured:', stream);
          }).catch(err => {
            console.error('Failed to capture alert stream:', err);
          });
        }
      `)

      // Get sources for desktop capture
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        fetchWindowIcons: false
      })

      // Find the webview window source
      const webviewSource = sources.find(source => 
        source.name.includes('Alert') || 
        source.name.includes('Twitch') ||
        source.id.includes(webContentsId.toString())
      )

      if (webviewSource) {
        return {
          success: true,
          streamId: webviewSource.id,
          nodeId
        }
      }

      // Fallback: return first screen source
      return {
        success: true,
        streamId: sources[0]?.id || 'screen:0:0',
        nodeId
      }

    } catch (error) {
      console.error('Error capturing webview stream:', error)
      return {
        success: false,
        error: error.message,
        nodeId
      }
    }
  })

  // Additional helper for webview audio enabling
  ipcMain.handle('enable-webview-audio', async (_event, { webContentsId }) => {
    try {
      const targetWebContents = webContents.fromId(webContentsId)
      
      if (!targetWebContents) {
        return { success: false }
      }

      // Set audio policy for the webview
      targetWebContents.audioMuted = false
      await targetWebContents.setAudioMuted(false)
      
      return { success: true }
    } catch (error) {
      console.error('Error enabling webview audio:', error)
      return { success: false, error: error.message }
    }
  })
}

module.exports = operations
