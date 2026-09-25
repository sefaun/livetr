const { app, BrowserWindow, dialog, screen, session, shell } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { createStore } = require('./store.cjs')
const { StreamManager } = require('./stream.cjs')
const { resolveFfmpegPath } = require('./ffmpeg.cjs')
const { registerIpcHandlers } = require('./ipc.cjs')
const i18n = require('./i18n.cjs')

const development = process.env.NODE_MODE == 'development'
const devServerUrl = process.env.LIVETR_DEV_SERVER_URL || 'http://localhost:3001'
const indexHtml = path.join(__dirname, '../dist/index.html')
const appId = 'com.livetr.id'
const SPLASH_MIN_MS = 1500

/** Uygulamanın kendi sayfası dışında hiçbir izin verilmez; kamera/mikrofon ve ekran yakalama gereklidir. */
const allowedPermissions = new Set(['media', 'display-capture', 'fullscreen', 'clipboard-sanitized-write'])

// Pencere küçültülse, arkada kalsa ya da başka bir pencerenin altında kalsa bile
// canvas çizimi, zamanlayıcılar ve kodlama tam hızda devam etmeli; aksi hâlde yayın donar.
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
// Ses motoru (AudioContext) ve videolar kullanıcı etkileşimi beklemeden çalışabilmeli.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

let mainWindow = null
let splashWindow = null
let splashShownAt = 0
let closeConfirmed = false
let quitRequested = false

function resolveDataDir() {
  if (process.env.LIVETR_DATA_DIR) {
    return path.resolve(process.env.LIVETR_DATA_DIR)
  }

  // Geliştirme ortamında veriler proje içindeki store klasöründe tutulur (önceki davranış).
  return app.isPackaged ? path.join(app.getPath('userData'), 'store') : path.join(app.getAppPath(), 'store')
}

/** electron-builder "extraFiles" ile kopyalanan örnek medyaların bulunduğu klasör. */
function resolveBundledStoreDir() {
  if (!app.isPackaged) {
    return path.join(app.getAppPath(), 'store')
  }

  return process.platform == 'darwin'
    ? path.join(process.resourcesPath, '..', 'store')
    : path.join(path.dirname(process.execPath), 'store')
}

function resolveRecordingsDir() {
  try {
    return path.join(app.getPath('videos'), 'Livetr')
  } catch (_error) {
    return path.join(resolveDataDir(), 'recordings')
  }
}

const store = createStore({
  dataDir: resolveDataDir(),
  bundledStoreDir: resolveBundledStoreDir(),
  // Eski sürümler verileri çalışma klasörüne (process.cwd()/store) yazıyordu.
  legacyDirs: app.isPackaged
    ? [path.join(path.dirname(process.execPath), 'store'), path.join(process.cwd(), 'store')]
    : [],
})

const stream = new StreamManager({
  ffmpegPath: resolveFfmpegPath(),
  recordingsDir: resolveRecordingsDir(),
})

stream.on('event', (event) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('stream:event', event)
  }
})

function isAppUrl(url) {
  try {
    if (development) {
      return new URL(url).origin == new URL(devServerUrl).origin
    }

    return url.split('#')[0] == pathToFileURL(indexHtml).href
  } catch (_error) {
    return false
  }
}

function createSplashWindow() {
  splashShownAt = Date.now()
  splashWindow = new BrowserWindow({
    width: 380,
    height: 140,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    skipTaskbar: true,
  })

  splashWindow.loadFile(path.join(__dirname, 'splash.html'))
  splashWindow.on('closed', () => (splashWindow = null))
}

function closeSplashWindow() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.destroy()
  }

  splashWindow = null
}

function createMainWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay()

  mainWindow = new BrowserWindow({
    title: 'Livetr',
    width: Math.min(1500, workAreaSize.width),
    height: Math.min(900, workAreaSize.height),
    minWidth: Math.min(1100, workAreaSize.width),
    minHeight: Math.min(680, workAreaSize.height),
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, development ? '../public/icon.png' : '../dist/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Sahnede kullanıcının seçtiği yerel dosyalar (file://) gösterilir ve yayın canvas'ına çizilir.
      // Web güvenliği açık olursa bu dosyalar geliştirme sunucusundan yüklenemez ve canvas "tainted" olur.
      webSecurity: false,
      // Pencere arka plandayken de yayın canvas'ı ve zamanlayıcılar yavaşlatılmamalı.
      backgroundThrottling: false,
      devTools: development,
      spellcheck: false,
    },
  })

  const win = mainWindow

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

  // Pencereye dosya sürüklenip bırakıldığında ya da bir bağlantıya tıklandığında uygulama sayfası değişmemeli.
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

  // Sayfa yenilenirse ya da çökerse yayını besleyen kaynak ortadan kalkar; ffmpeg düzgünce kapatılır.
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
        // Uygulamadan çıkılıyorsa (ör. macOS'ta Cmd+Q) çıkış tamamlanır, yoksa sadece pencere kapanır.
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
  // Aynı veriler üzerinde iki uygulama çalışmamalı (dosyalar ve yayın çakışır).
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
    // Masaüstü bildirimlerinde uygulama adı gösterilecek.
    if (process.platform == 'win32') {
      app.setAppUserModelId(appId)
    }

    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      callback(allowedPermissions.has(permission))
    })

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
    // Her ihtimale karşı: uygulama kapanırken arkada ffmpeg süreci bırakılmaz.
    stream.kill()

    // Pencere kapanırken gönderilen son kayıtların diske yazılması beklenir.
    // will-quit engellendikten sonra app.quit() tekrar çalışmadığı için (pencereler zaten kapalı) app.exit() kullanılır.
    if (!storeFlushed) {
      event.preventDefault()
      storeFlushed = true
      store.flush().finally(() => app.exit(0))
    }
  })
}
