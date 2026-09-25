const { spawn } = require('node:child_process')
const { EventEmitter } = require('node:events')
const fs = require('node:fs')
const path = require('node:path')
const {
  ffmpegExists,
  normalizeStreamConfig,
  buildFfmpegArgs,
  createProgressParser,
  extractErrorMessage,
  createSecretMasker,
  recordingFileName,
} = require('./ffmpeg.cjs')

/** Bağlantı kurulup ilk kare gönderilene kadar beklenecek süre. */
const CONNECT_TIMEOUT_MS = 30000
/** Canlıyken ffmpeg bu süre boyunca ilerleme bildirmezse yayın takılmış kabul edilir (ağ kopması vb.). */
const STALL_TIMEOUT_MS = 20000
/** Kapatma sırasında ffmpeg'in tamponu boşaltıp çıkması için tanınan süre. */
const STOP_TIMEOUT_MS = 8000
/** Kapatırken bu kadar veri hâlâ bekliyorsa beklenmez, girdi hemen kapatılır. */
const STOP_DISCARD_BYTES = 4 * 1024 * 1024
/** ffmpeg'e yazılmayı bekleyen veri bu sınırı aşarsa (bellek koruması) yayın durdurulur. */
const MAX_BUFFERED_BYTES = 256 * 1024 * 1024
/** Bekleyen veri bu kadar saniyelik yayına denk gelirse kullanıcı uyarılır. */
const CONGESTION_SECONDS = 3
const MAX_LOG_LINES = 60

/**
 * ffmpeg sürecini yönetir: başlatma, veri aktarımı (backpressure takibi), ilerleme istatistikleri,
 * hata tespiti ve düzgün kapatma. Renderer yeniden yüklense ya da kapansa bile süreç ana süreçte kontrol altındadır.
 *
 * Olaylar (`event`):
 *  - { type: 'state', state: 'starting' | 'live' | 'stopping' | 'idle' }
 *  - { type: 'stats', stats }
 *  - { type: 'warning', code: 'congested' | 'recovered' }
 *  - { type: 'ended', reason: 'stopped' | 'error', message?, details?, recordPath? }
 */
class StreamManager extends EventEmitter {
  constructor({ ffmpegPath, recordingsDir, log = console }) {
    super()
    this.ffmpegPath = ffmpegPath
    this.recordingsDir = recordingsDir
    this.log = log
    this.process = null
    this.state = 'idle'
    this.session = null
  }

  isActive() {
    return this.process != null
  }

  setState(state) {
    if (this.state != state) {
      this.state = state
      this.emit('event', { type: 'state', state })
    }
  }

  /**
   * ffmpeg'i başlatır. Veri, `write()` ile gönderilmeye başlanmalıdır.
   */
  start(rawConfig) {
    if (this.process) {
      throw new Error('A stream is already running')
    }

    if (!ffmpegExists(this.ffmpegPath)) {
      throw new Error(`ffmpeg binary not found: ${this.ffmpegPath ?? '-'}`)
    }

    const config = normalizeStreamConfig(rawConfig)
    let recordPath = null
    if (config.record) {
      fs.mkdirSync(this.recordingsDir, { recursive: true })
      recordPath = path.join(this.recordingsDir, recordingFileName())
    }

    const args = buildFfmpegArgs(config, { recordPath })
    const child = spawn(this.ffmpegPath, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })

    const session = {
      child,
      config,
      recordPath,
      stopping: false,
      failure: null,
      logLines: [],
      stderrBuffer: '',
      writtenBytes: 0,
      startedAt: Date.now(),
      liveAt: 0,
      lastProgressAt: 0,
      lastOutTimeMs: -1,
      congested: false,
      lastWriteAt: Date.now(),
      lastFrame: 0,
      lastFrameAt: 0,
      currentFps: 0,
      mask: createSecretMasker(config.url),
      timer: null,
      stopTimer: null,
      closed: false,
      resolveExited: null,
      exited: null,
    }
    session.exited = new Promise((resolve) => (session.resolveExited = resolve))

    this.process = child
    this.session = session
    this.setState('starting')
    this.log.info?.(`[stream] ffmpeg started (${config.width}x${config.height}@${config.fps}, ${config.videoBitrate}k)`)

    child.stdout.on(
      'data',
      createProgressParser((stats) => this.onProgress(session, stats))
    )
    child.stderr.on('data', (chunk) => this.onStderr(session, chunk))
    // ffmpeg kapandıktan sonra yapılan yazmalar EPIPE üretir; asıl hata 'close' olayında raporlanır.
    child.stdin.on('error', () => {})
    child.on('error', (error) => {
      this.fail(session, `ffmpeg could not be started: ${error.message}`)
      // Süreç hiç başlayamadıysa 'close' olayı gelmeyebilir.
      if (child.pid == null) {
        this.onClose(session, null, null)
      }
    })
    child.on('close', (code, signal) => this.onClose(session, code, signal))

    session.timer = setInterval(() => this.watchdog(session), 1000)

    return { recordPath }
  }

  /**
   * MediaRecorder'dan gelen WebM parçasını ffmpeg'e yazar.
   */
  write(chunk) {
    const session = this.session
    if (!session || session.stopping || !chunk) {
      return
    }

    const stdin = session.child.stdin
    if (!stdin.writable) {
      return
    }

    const buffer = Buffer.isBuffer(chunk)
      ? chunk
      : ArrayBuffer.isView(chunk)
        ? Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength)
        : Buffer.from(chunk)

    session.writtenBytes += buffer.length
    session.lastWriteAt = Date.now()
    stdin.write(buffer)

    if (stdin.writableLength > MAX_BUFFERED_BYTES) {
      this.fail(session, 'The stream cannot keep up (network or CPU is too slow).')
    }
  }

  /**
   * Yayını düzgün şekilde sonlandırır: girdi kapatılır, ffmpeg kalan veriyi kodlayıp platforma iletir ve çıkar.
   * Belirlenen sürede çıkmazsa süreç zorla sonlandırılır.
   */
  stop() {
    const session = this.session
    if (!session) {
      return Promise.resolve()
    }

    if (!session.stopping) {
      session.stopping = true
      this.setState('stopping')

      const stdin = session.child.stdin
      if (stdin.writableLength > STOP_DISCARD_BYTES) {
        stdin.destroy()
      } else {
        stdin.end()
      }

      session.stopTimer = setTimeout(() => {
        this.log.warn?.('[stream] ffmpeg did not exit in time, killing it')
        session.child.kill('SIGKILL')
      }, STOP_TIMEOUT_MS)
    }

    return session.exited.then(() => undefined)
  }

  /** Uygulama kapanırken beklemeden süreci sonlandırır. */
  kill() {
    if (this.session) {
      this.session.stopping = true
      this.session.child.kill('SIGKILL')
    }
  }

  onProgress(session, stats) {
    if (session != this.session) {
      return
    }

    const now = Date.now()
    if (stats.outTimeMs > session.lastOutTimeMs) {
      session.lastOutTimeMs = stats.outTimeMs
      session.lastProgressAt = now
    }

    // ffmpeg'in bildirdiği fps başlangıçtan beri ortalamadır; son saniyedeki gerçek kare hızı hesaplanır.
    if (session.lastFrameAt && now > session.lastFrameAt) {
      const fps = ((stats.frame - session.lastFrame) * 1000) / (now - session.lastFrameAt)
      session.currentFps = session.currentFps ? session.currentFps * 0.5 + fps * 0.5 : fps
    }
    session.lastFrame = stats.frame
    session.lastFrameAt = now

    if (!session.liveAt && stats.outTimeMs > 0 && !session.stopping) {
      session.liveAt = now
      this.setState('live')
    }

    const stdin = session.child.stdin
    const bufferedBytes = stdin.writableLength
    const elapsedSeconds = Math.max(1, (now - session.startedAt) / 1000)
    const inputBytesPerSecond = session.writtenBytes / elapsedSeconds
    const bufferedSeconds = inputBytesPerSecond > 0 ? bufferedBytes / inputBytesPerSecond : 0

    if (!session.congested && bufferedSeconds > CONGESTION_SECONDS) {
      session.congested = true
      this.emit('event', { type: 'warning', code: 'congested' })
    } else if (session.congested && bufferedSeconds < 1) {
      session.congested = false
      this.emit('event', { type: 'warning', code: 'recovered' })
    }

    this.emit('event', {
      type: 'stats',
      stats: {
        ...stats,
        fps: Math.round(session.currentFps * 10) / 10,
        bufferedBytes,
        bufferedSeconds: Math.round(bufferedSeconds * 10) / 10,
        liveSince: session.liveAt,
      },
    })
  }

  onStderr(session, chunk) {
    session.stderrBuffer += chunk.toString()
    const lines = session.stderrBuffer.split(/\r?\n/)
    session.stderrBuffer = lines.pop()

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      session.logLines.push(line)
      if (session.logLines.length > MAX_LOG_LINES) {
        session.logLines.shift()
      }

      if (process.env.NODE_MODE == 'development') {
        this.log.info?.(`[ffmpeg] ${session.mask(line)}`)
      }
    }
  }

  watchdog(session) {
    if (session != this.session || session.stopping) {
      return
    }

    const now = Date.now()
    if (!session.liveAt && now - session.startedAt > CONNECT_TIMEOUT_MS) {
      this.fail(session, 'Could not connect to the streaming server (timeout).')
    } else if (session.liveAt && now - session.lastWriteAt > STALL_TIMEOUT_MS) {
      this.fail(session, 'No video data was received from the studio.')
    } else if (session.liveAt && now - session.lastProgressAt > STALL_TIMEOUT_MS) {
      this.fail(session, 'The connection to the streaming server was lost (no data could be sent).')
    }
  }

  fail(session, message) {
    if (session != this.session || session.failure) {
      return
    }

    session.failure = message
    session.stopping = true
    this.log.error?.(`[stream] ${message}`)
    session.child.stdin.destroy()
    if (session.child.pid != null) {
      session.child.kill('SIGKILL')
    }
  }

  onClose(session, code, signal) {
    if (session.closed) {
      return
    }

    session.closed = true
    clearInterval(session.timer)
    clearTimeout(session.stopTimer)

    if (session.stderrBuffer.trim()) {
      session.logLines.push(session.stderrBuffer)
    }

    const details = session.mask(session.logLines.slice(-15).join('\n'))
    const userStopped = session.stopping && !session.failure
    let event

    if (userStopped) {
      event = { type: 'ended', reason: 'stopped', recordPath: session.recordPath }
    } else {
      const message =
        session.failure ||
        extractErrorMessage(session.logLines) ||
        `ffmpeg exited unexpectedly (${signal ? `signal ${signal}` : `code ${code}`})`
      event = {
        type: 'ended',
        reason: 'error',
        message: session.mask(message),
        details,
        recordPath: session.recordPath,
      }
    }

    this.log.info?.(`[stream] ffmpeg exited (code: ${code}, signal: ${signal}, reason: ${event.reason})`)

    if (session.recordPath && !fs.existsSync(session.recordPath)) {
      event.recordPath = null
    }

    if (this.session == session) {
      this.process = null
      this.session = null
    }

    this.setState('idle')
    this.emit('event', event)
    session.resolveExited()
  }
}

module.exports = { StreamManager }
