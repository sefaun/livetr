import fs from 'node:fs'
import { createRequire } from 'node:module'
import type { TStreamConfig, TStreamStats } from '../shared/ipc.js'

type TRange = readonly [min: number, max: number]

export const limits = {
  width: [128, 3840],
  height: [72, 2160],
  fps: [1, 60],
  videoBitrate: [100, 20000],
  audioBitrate: [32, 320],
} as const satisfies Record<string, TRange>

const allowedProtocols: ReadonlySet<string> = new Set(['rtmp:', 'rtmps:'])

export type TProgress = Omit<TStreamStats, 'bufferedBytes' | 'bufferedSeconds' | 'liveSince'>

const require = createRequire(import.meta.url)

export function resolveFfmpegPath(): string | null {
  const customPath = process.env.LIVETR_FFMPEG_PATH
  if (customPath) {
    return customPath
  }

  let binaryPath: string | null
  try {
    binaryPath = require('ffmpeg-static') as string | null
  } catch (_error) {
    return null
  }

  // Paketlenmiş uygulamada binary, asar arşivinin dışında (app.asar.unpacked) bulunur.
  return binaryPath ? binaryPath.replace(/app\.asar([\\/])/, 'app.asar.unpacked$1') : null
}

export function ffmpegExists(binaryPath: string | null): binaryPath is string {
  if (!binaryPath) {
    return false
  }

  try {
    return fs.statSync(binaryPath).isFile()
  } catch (_error) {
    return false
  }
}

function toInteger(value: unknown, [min, max]: TRange, name: string): number {
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Invalid ${name}: ${String(value)}`)
  }

  return Math.round(number)
}

export function normalizeStreamConfig(config: unknown): TStreamConfig {
  if (!config || typeof config != 'object') {
    throw new Error('Missing stream configuration')
  }

  const input = config as Partial<Record<keyof TStreamConfig, unknown>>
  const url = String(input.url ?? '').trim()
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch (_error) {
    throw new Error('Invalid stream URL')
  }

  if (!allowedProtocols.has(parsedUrl.protocol) || !parsedUrl.hostname) {
    throw new Error('Stream URL must start with rtmp:// or rtmps://')
  }

  const width = toInteger(input.width, limits.width, 'width')
  const height = toInteger(input.height, limits.height, 'height')

  return {
    url,
    // H.264 (yuv420p) çift sayı boyut ister.
    width: width - (width % 2),
    height: height - (height % 2),
    fps: toInteger(input.fps, limits.fps, 'fps'),
    videoBitrate: toInteger(input.videoBitrate, limits.videoBitrate, 'video bitrate'),
    audioBitrate: toInteger(input.audioBitrate, limits.audioBitrate, 'audio bitrate'),
    record: input.record === true,
  }
}

/** tee muxer çıktı adresini av_get_token kurallarına göre tek tırnakla kaçışlar. */
export function escapeTeeValue(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}

export function buildFfmpegArgs(config: TStreamConfig, options: { recordPath?: string | null } = {}): string[] {
  const gop = config.fps * 2
  const recordPath = config.record ? options.recordPath : null

  const args = [
    '-hide_banner',
    '-loglevel',
    'repeat+level+warning',
    '-nostats',
    '-stats_period',
    '1',
    '-progress',
    'pipe:1',
    '-f',
    'matroska',
    '-i',
    'pipe:0',
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    // Twitch/YouTube 2 saniyelik keyframe aralığı ve sabit bitrate bekler.
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-pix_fmt',
    'yuv420p',
    '-vf',
    `scale=${config.width}:${config.height}`,
    '-r',
    String(config.fps),
    '-g',
    String(gop),
    '-sc_threshold',
    '0',
    '-b:v',
    `${config.videoBitrate}k`,
    '-maxrate',
    `${config.videoBitrate}k`,
    '-bufsize',
    `${config.videoBitrate * 2}k`,
    '-c:a',
    'aac',
    '-b:a',
    `${config.audioBitrate}k`,
    '-ar',
    '48000',
    '-ac',
    '2',
  ]

  if (recordPath) {
    // Tek kodlamayla yayın + yerel kayıt; kayıt hatası yayını durdurmaz.
    args.push(
      '-flags',
      '+global_header',
      '-f',
      'tee',
      `[f=flv:flvflags=no_duration_filesize]${escapeTeeValue(config.url)}|[f=mpegts:onfail=ignore]${escapeTeeValue(
        recordPath.replace(/\\/g, '/')
      )}`
    )
  } else {
    args.push('-f', 'flv', '-flvflags', 'no_duration_filesize', config.url)
  }

  return args
}

function toNumber(value: string | undefined): number {
  const number = parseFloat(value ?? '')
  return Number.isFinite(number) ? number : 0
}

function toStats(block: Readonly<Record<string, string>>): TProgress {
  return {
    frame: toNumber(block.frame),
    fps: toNumber(block.fps),
    bitrate: toNumber(block.bitrate),
    totalSize: toNumber(block.total_size),
    outTimeMs: Math.max(0, Math.round(toNumber(block.out_time_us) / 1000)),
    dupFrames: toNumber(block.dup_frames),
    dropFrames: toNumber(block.drop_frames),
    speed: toNumber(block.speed),
    ended: block.progress == 'end',
  }
}

export function createProgressParser(onProgress: (stats: TProgress) => void): (chunk: Buffer | string) => void {
  let buffer = ''
  let block: Record<string, string> = {}

  return (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const index = line.indexOf('=')
      if (index == -1) {
        continue
      }

      const key = line.slice(0, index).trim()
      block[key] = line.slice(index + 1).trim()

      if (key == 'progress') {
        onProgress(toStats(block))
        block = {}
      }
    }
  }
}

export function extractErrorMessage(lines: readonly string[]): string {
  const cleaned = lines
    .map((line) => line.replace(/^\[[^\]]+ @ [^\]]+\]\s*/, '').trim())
    .filter((line) => line && !/^\[(info|verbose|debug)\]/.test(line))

  const errors = cleaned.filter((line) => /^\[(error|fatal|panic)\]/.test(line))
  const pick = (errors.length ? errors : cleaned).filter((line) => !/Conversion failed!/i.test(line))
  const message = pick.at(-1) ?? cleaned.at(-1) ?? ''

  return message.replace(/^\[(error|fatal|panic|warning)\]\s*/, '')
}

export function createSecretMasker(url: string): (text: unknown) => string {
  let masked = url
  const secrets = [url]

  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
    const [app] = segments
    masked = `${parsed.protocol}//${parsed.host}/${app ? `${app}/` : ''}****`

    if (segments.length > 1) {
      secrets.push(segments.slice(1).join('/'))
    }
    if (parsed.search.length > 1) {
      secrets.push(parsed.search.slice(1))
    }
  } catch (_error) {}

  return (text) => {
    let result = String(text ?? '')
    for (const [index, secret] of secrets.entries()) {
      if (secret.length >= 4) {
        result = result.split(secret).join(index == 0 ? masked : '****')
      }
    }
    return result
  }
}

function timestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}

export function recordingFileName(date: Date = new Date()): string {
  return `livetr_${timestamp(date)}.ts`
}
