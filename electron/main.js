const { app, BrowserWindow } = require('electron/main')

const path = require('node:path')
const operations = require('./operations')

const development = true //process.env.NODE_MODE == 'development'
let win
let splashWindow
app.disableHardwareAcceleration()
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    frame: false,
    transparent: true,
    center: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      offscreen: true,
      devTools: development,
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  })
  splashWindow.webContents.openDevTools({
    mode: 'detach',
  })

  splashWindow.loadURL(
    'https://dashboard.twitch.tv/widgets/alertbox#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGVydF9zZXRfaWQiOiJmNTA3NDBjYy1mNzY5LTRiYjUtYTg2ZS1iNWQ5YmMyZTk2MzYiLCJ1c2VyX2lkIjoiNzQ1MzQ5ODA2In0.2_ZGg5A9N7EhOkJu189nXYClOFOrJkTWFfcPWilsRx8'
  )
  splashWindow.webContents.on('did-finish-load', () => {
    splashWindow.webContents.setFrameRate(30) // performans için fps limiti
  })

  let bitmapBuffer
  let size
  splashWindow.webContents.on('paint', (_event, _dirty, image) => {
    bitmapBuffer = image.toBitmap() // raw RGBA verisi
    size = image.getSize()

    win.webContents.send('frame', {
      width: size.width,
      height: size.height,
      buffer: bitmapBuffer.buffer, // ArrayBuffer olarak gönder
    })
  })
}

function createWindow() {
  win = new BrowserWindow({
    title: 'Livetr',
    width: 1500,
    height: 900,
    resizable: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    transparent: false,
    show: false,
    webPreferences: {
      devTools: development,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
    },
  })

  if (true) {
    win.loadURL('http://localhost:3001/#/studio')
  } else {
    win.loadURL(`file://${path.join(__dirname, '../dist/index.html')}#/studio`)
  }

  win.webContents.openDevTools({
    mode: 'detach',
  })

  operations()

  win.on('ready-to-show', () => {
    setTimeout(() => {
      // splashWindow.destroy() // Splash ekranı kapat
      win.show() // Ana pencereyi göster
    }, 2000)
  })
}

app.whenReady().then(() => {
  createSplashWindow()
  createWindow()

  //Masaüstü bildiriminde app ismi gösterilecek.
  if (process.platform == 'win32') {
    app.setAppUserModelId(app.name)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
