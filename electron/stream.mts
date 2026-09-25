import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import type { TStreamConfig, TStreamEndedEvent, TStreamEvent, TStreamStartResult, TStreamState } from '../shared/ipc.js'
import {
  buildFfmpegArgs,
  createProgressParser,
  createSecretMasker,
  extractErrorMessage,
  ffmpegExists,
  normalizeStreamConfig,
  recordingFileName,
  type TProgress,
} from './ffmpeg.mjs'

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

export type TLogger = Pick<Console, 'info' | 'warn' | 'error'>

type TStreamManagerOptions = {
  ffmpegPath: string | null
  recordingsDir: string
  log?: TLogger
}

type TSession = {
  child: ChildProcessWithoutNullStreams
  config: TStreamConfig
  recordPath: string | null
  mask: (text: unknown) => string
  stopping: boolean
  failure: string | null
  closed: boolean
  logLines: string[]
  stderrBuffer: string
  writtenBytes: number
  startedAt: number
  liveAt: number
  lastWriteAt: number
  lastProgressAt: number
  lastOutTimeMs: number
  lastFrame: number
  lastFrameAt: number
  currentFps: number
  congested: boolean
  timer: NodeJS.Timeout | null
  stopTimer: NodeJS.Timeout | null
  exited: Promise<void>
  resolveExited: () => void
}

type TStreamManagerEvents = {
  event: [event: TStreamEvent]
}

/** IPC ile gelen veri parçasını Buffer'a çevirir (ArrayBuffer, TypedArray ya da Buffer olabilir). */
function toBuffer(chunk: unknown): Buffer | null {
  if (Buffer.isBuffer(chunk)) {
    return chunk
  }

  if (ArrayBuffer.isView(chunk)) {
    return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength)
  }

  if (chunk instanceof ArrayBuffer) {
    return Buffer.from(chunk)
  }

  return null
}

/**
 * ffmpeg sürecini yönetir: başlatma, veri aktarımı (backpressure takibi), ilerleme istatistikleri,
 * hata tespiti ve düzgün kapatma. Renderer yeniden yüklense ya da kapansa bile süreç ana süreçte kontrol altındadır.
 */
export class StreamManager extends EventEmitter<TStreamManagerEvents> {
  private readonly ffmpegPath: string | null
  private readonly recordingsDir: string
  private readonly log: TLogger
  private session: TSession | null = null
  private state: TStreamState = 'idle'

  constructor({ ffmpegPath, recordingsDir, log = console }: TStreamManagerOptions) {
    super()
    this.ffmpegPath = ffmpegPath
    this.recordingsDir = recordingsDir
    this.log = log
  }

  isActive(): boolean {
    return this.session != null
  }

  private setState(state: TStreamState): void {
    if (this.state != state) {
      this.state = state
      this.emit('event', { type: 'state', state })
    }
  }

  /**
   * ffmpeg'i başlatır. Veri, `write()` ile gönderilmeye başlanmalıdır.
   */
  start(rawConfig: unknown): TStreamStartResult {
    if (this.session) {
      throw new Error('A stream is already running')
    }

    if (!ffmpegExists(this.ffmpegPath)) {
      throw new Error(`ffmpeg binary not found: ${this.ffmpegPath ?? '-'}`)
    }

    const config = normalizeStreamConfig(rawConfig)
    let recordPath: string | null = null
    if (config.record) {
      fs.mkdirSync(this.recordingsDir, { recursive: true })
      recordPath = path.join(this.recordingsDir, recordingFileName())
    }

    const child = spawn(this.ffmpegPath, buildFfmpegArgs(config, { recordPath }), { windowsHide: true })

    let resolveExited: () => void = () => {}
    const exited = new Promise<void>((resolve) => (resolveExited = resolve))
    const now = Date.now()
    const session: TSession = {
      child,
      config,
      recordPath,
      mask: createSecretMasker(config.url),
      stopping: false,
      failure: null,
      closed: false,
      logLines: [],
      stderrBuffer: '',
      writtenBytes: 0,
      startedAt: now,
      liveAt: 0,
      lastWriteAt: now,
      lastProgressAt: 0,
      lastOutTimeMs: -1,
      lastFrame: 0,
      lastFrameAt: 0,
      currentFps: 0,
      congested: false,
      timer: null,
      stopTimer: null,
      exited,
      resolveExited,
    }

    this.session = session
    this.setState('starting')
    this.log.info(`[stream] ffmpeg started (${config.width}x${config.height}@${config.fps}, ${config.videoBitrate}k)`)

    child.stdout.on(
      'data',
      createProgressParser((stats) => this.onProgress(session, stats))
    )
    child.stderr.on('data', (chunk: Buffer) => this.onStderr(session, chunk))
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
  write(chunk: unknown): void {
    const session = this.session
    if (!session || session.stopping) {
      return
    }

    const buffer = toBuffer(chunk)
    const stdin = session.child.stdin
    if (!buffer || !stdin.writable) {
      return
    }

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
  stop(): Promise<void> {
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
        this.log.warn('[stream] ffmpeg did not exit in time, killing it')
        session.child.kill('SIGKILL')
      }, STOP_TIMEOUT_MS)
    }

    return session.exited
  }

  /** Uygulama kapanırken beklemeden süreci sonlandırır. */
  kill(): void {
    if (this.session) {
      this.session.stopping = true
      this.session.child.kill('SIGKILL')
    }
  }

  private onProgress(session: TSession, stats: TProgress): void {
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

    const bufferedBytes = session.child.stdin.writableLength
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

  private onStderr(session: TSession, chunk: Buffer): void {
    session.stderrBuffer += chunk.toString()
    const lines = session.stderrBuffer.split(/\r?\n/)
    session.stderrBuffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      session.logLines.push(line)
      if (session.logLines.length > MAX_LOG_LINES) {
        session.logLines.shift()
      }

      if (process.env.NODE_MODE == 'development') {
        this.log.info(`[ffmpeg] ${session.mask(line)}`)
      }
    }
  }

  private watchdog(session: TSession): void {
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

  private fail(session: TSession, message: string): void {
    if (session != this.session || session.failure) {
      return
    }

    session.failure = message
    session.stopping = true
    this.log.error(`[stream] ${message}`)
    session.child.stdin.destroy()
    if (session.child.pid != null) {
      session.child.kill('SIGKILL')
    }
  }

  private onClose(session: TSession, code: number | null, signal: NodeJS.Signals | null): void {
    if (session.closed) {
      return
    }

    session.closed = true
    if (session.timer) {
      clearInterval(session.timer)
    }
    if (session.stopTimer) {
      clearTimeout(session.stopTimer)
    }

    if (session.stderrBuffer.trim()) {
      session.logLines.push(session.stderrBuffer)
    }

    const recordPath = session.recordPath && fs.existsSync(session.recordPath) ? session.recordPath : null
    let event: TStreamEndedEvent

    if (session.stopping && !session.failure) {
      event = { type: 'ended', reason: 'stopped', recordPath }
    } else {
      const message =
        session.failure ||
        extractErrorMessage(session.logLines) ||
        `ffmpeg exited unexpectedly (${signal ? `signal ${signal}` : `code ${code}`})`

      event = {
        type: 'ended',
        reason: 'error',
        message: session.mask(message),
        details: session.mask(session.logLines.slice(-15).join('\n')),
        recordPath,
      }
    }

    this.log.info(`[stream] ffmpeg exited (code: ${code}, signal: ${signal}, reason: ${event.reason})`)

    if (this.session == session) {
      this.session = null
    }

    this.setState('idle')
    this.emit('event', event)
    session.resolveExited()
  }
}
