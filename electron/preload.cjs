const { contextBridge, ipcRenderer } = require('electron')

/**
 * Renderer'a açılan masaüstü API'si (window.livetr).
 * Renderer'da Node.js erişimi yoktur; dosya, diyalog, ekran yakalama ve ffmpeg işlemleri bu köprü üzerinden
 * ana süreçte yapılır. Tipler: src/platform/types.ts (TDesktopApi).
 */
contextBridge.exposeInMainWorld('livetr', {
  platform: process.platform,
  store: {
    load: () => ipcRenderer.invoke('store:load'),
    saveStudio: (content) => ipcRenderer.invoke('store:save-studio', content),
    saveNodebar: (content) => ipcRenderer.invoke('store:save-nodebar', content),
    saveSceneThumbnail: (sceneId, bytes) => ipcRenderer.invoke('store:save-scene-thumbnail', sceneId, bytes),
    readSceneThumbnail: (sceneId) => ipcRenderer.invoke('store:read-scene-thumbnail', sceneId),
    removeSceneThumbnail: (sceneId) => ipcRenderer.invoke('store:remove-scene-thumbnail', sceneId),
  },
  dialog: {
    openMedia: (kind) => ipcRenderer.invoke('dialog:open-media', kind),
  },
  media: {
    getDesktopSources: () => ipcRenderer.invoke('media:desktop-sources'),
  },
  stream: {
    start: (config) => ipcRenderer.invoke('stream:start', config),
    stop: () => ipcRenderer.invoke('stream:stop'),
    write: (chunk) => ipcRenderer.send('stream:write', chunk),
    onEvent: (listener) => {
      const handler = (_event, data) => listener(data)
      ipcRenderer.on('stream:event', handler)
      return () => ipcRenderer.removeListener('stream:event', handler)
    },
  },
  app: {
    setLocale: (locale) => ipcRenderer.send('app:set-locale', locale),
  },
})
