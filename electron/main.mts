import { app, BrowserWindow, dialog, screen, session, shell } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveFfmpegPath } from './ffmpeg.mjs'
import * as i18n from './i18n.mjs'
import { registerIpcHandlers } from './ipc.mjs'
import { handleMediaProtocol, registerMediaScheme } from './media-protocol.mjs'
import { createStore } from './store.mjs'
import { StreamManager } from './stream.mjs'
import type { TEventChannel, TEventChannels } from '../shared/ipc.js'

const currentDir = import.meta.dirname
const development = process.env.NODE_MODE == 'development'
const devServerUrl = process.env.LIVETR_DEV_SERVER_URL || 'http://localhost:3001'
const indexHtml = path.join(currentDir, '../dist/index.html')
const appId = 'com.livetr.id'
const SPLASH_MIN_MS = 1500

const allowedPermissions: ReadonlySet<string> = new Set([
  'media',
  'display-capture',
  'fullscreen',
  'clipboard-sanitized-write',
])

// Pencere küçültülse ya da arkada kalsa bile canvas çizimi ve zamanlayıcılar yavaşlamamalı; aksi hâlde yayın donar.
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

registerMediaScheme()

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null
let splashShownAt = 0
let closeConfirmed = false
let quitRequested = false

function resolveDataDir(): string {
  if (process.env.LIVETR_DATA_DIR) {
    return path.resolve(process.env.LIVETR_DATA_DIR)
  }

  return app.isPackaged ? path.join(app.getPath('userData'), 'store') : path.join(app.getAppPath(), 'store')
}

function resolveBundledStoreDir(): string {
  if (!app.isPackaged) {
    return path.join(app.getAppPath(), 'store')
  }

  return process.platform == 'darwin'
    ? path.join(process.resourcesPath, '..', 'store')
    : path.join(path.dirname(process.execPath), 'store')
}

function resolveRecordingsDir(): string {
  try {
    return path.join(app.getPath('videos'), 'Livetr')
  } catch (_error) {
    return path.join(resolveDataDir(), 'recordings')
  }
}

const store = createStore({
  dataDir: resolveDataDir(),
  bundledStoreDir: resolveBundledStoreDir(),
  // Eski sürümler verileri çalışma klasörüne yazıyordu.
  legacyDirs: app.isPackaged
    ? [path.join(path.dirname(process.execPath), 'store'), path.join(process.cwd(), 'store')]
    : [],
})

const stream = new StreamManager({
  ffmpegPath: resolveFfmpegPath(),
  recordingsDir: resolveRecordingsDir(),
})

function sendToRenderer<K extends TEventChannel>(channel: K, ...args: TEventChannels[K]): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args)
  }
}

stream.on('event', (event) => sendToRenderer('stream:event', event))

function isAppUrl(url: string): boolean {
  try {
    if (development) {
      return new URL(url).origin == new URL(devServerUrl).origin
    }

    return url.split('#')[0] == pathToFileURL(indexHtml).href
  } catch (_error) {
    return false
  }
}

function createSplashWindow(): void {
  splashShownAt = Date.now()
  const splash = new BrowserWindow({
    width: 380,
    height: 140,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    skipTaskbar: true,
  })

  splash.loadFile(path.join(currentDir, 'splash.html'))
  splash.on('closed', () => {
    if (splashWindow == splash) {
      splashWindow = null
    }
  })
  splashWindow = splash
}

function closeSplashWindow(): void {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.destroy()
  }

  splashWindow = null
}

function createMainWindow(): void {
  const { workAreaSize } = screen.getPrimaryDisplay()

  const win = new BrowserWindow({
    title: 'Livetr',
    width: Math.min(1500, workAreaSize.width),
    height: Math.min(900, workAreaSize.height),
    minWidth: Math.min(1100, workAreaSize.width),
    minHeight: Math.min(680, workAreaSize.height),
    show: false,
    autoHideMenuBar: true,
    icon: path.join(currentDir, development ? '../public/icon.png' : '../dist/icon.png'),
    webPreferences: {
      preload: path.join(currentDir, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      devTools: development,
      spellcheck: false,
    },
  })
  mainWindow = win

  if (development) {
    win.loadURL(`${devServerUrl}/#/studio`)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(indexHtml, { hash: '/studio' })
  }

  win.once('ready-to-show', () => {
    setTimeout(
      () => {
        closeSplashWindow()
        if (!win.isDestroyed()) {
          win.show()
        }
      },
      Math.max(0, SPLASH_MIN_MS - (Date.now() - splashShownAt))
    )
  })

  // Pencereye bırakılan dosya ya da tıklanan bağlantı uygulama sayfasının yerini almamalı.
  win.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) {
      event.preventDefault()
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url)
    }

    return { action: 'deny' }
  })

  // Sayfa yenilenirse yayını besleyen kaynak ortadan kalkar.
  win.webContents.on('did-start-navigation', (event) => {
    if (event.isMainFrame && !event.isSameDocument) {
      stream.stop()
    }
  })

  win.webContents.on('render-process-gone', async (_event, details) => {
    if (details.reason == 'clean-exit') {
      return
    }

    await stream.stop()
    if (win.isDestroyed()) {
      return
    }

    const { response } = await dialog.showMessageBox(win, {
      type: 'error',
      title: 'Livetr',
      message: i18n.t('crashTitle'),
      detail: `${i18n.t('crashDetail')}\n(${details.reason})`,
      buttons: [i18n.t('reload'), i18n.t('close')],
      defaultId: 0,
      cancelId: 1,
    })

    if (win.isDestroyed()) {
      return
    }

    if (response == 0) {
      win.reload()
    } else {
      win.close()
    }
  })

  win.on('close', (event) => {
    if (closeConfirmed || !stream.isActive()) {
      return
    }

    event.preventDefault()
    const response = dialog.showMessageBoxSync(win, {
      type: 'warning',
      title: 'Livetr',
      message: i18n.t('liveQuitTitle'),
      detail: i18n.t('liveQuitDetail'),
      buttons: [i18n.t('liveQuitConfirm'), i18n.t('cancel')],
      defaultId: 1,
      cancelId: 1,
    })

    if (response == 0) {
      closeConfirmed = true
      stream.stop().finally(() => {
        // macOS'ta Cmd+Q ile çıkılıyorsa çıkış tamamlanır, yoksa sadece pencere kapanır.
        if (quitRequested) {
          app.quit()
        } else if (!win.isDestroyed()) {
          win.close()
        }
      })
    } else {
      quitRequested = false
    }
  })

  win.on('closed', () => {
    if (mainWindow == win) {
      mainWindow = null
    }
  })
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }

      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    if (process.platform == 'win32') {
      app.setAppUserModelId(appId)
    }

    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      callback(allowedPermissions.has(permission))
    })

    handleMediaProtocol()

    registerIpcHandlers({
      getMainWindow: () => mainWindow,
      store,
      stream,
      setLocale: i18n.setLocale,
    })

    createSplashWindow()
    createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        closeConfirmed = false
        createMainWindow()
      }
    })
  })

  app.on('before-quit', () => {
    quitRequested = true
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  let storeFlushed = false
  app.on('will-quit', (event) => {
    stream.kill()

    // Son kayıtlar diske yazılınca çıkılır; will-quit engellendikten sonra app.quit() tekrar çalışmaz.
    if (!storeFlushed) {
      event.preventDefault()
      storeFlushed = true
      store.flush().finally(() => app.exit(0))
    }
  })
}
