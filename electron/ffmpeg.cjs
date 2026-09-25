const fs = require('node:fs')

/**
 * Canlı yayın için ffmpeg ile ilgili saf (yan etkisiz) yardımcılar.
 * Stüdyo; canvas + ses mikserini MediaRecorder ile WebM (VP8/Opus) olarak kodlar ve stdin'den ffmpeg'e aktarır.
 * ffmpeg bu akışı Twitch/YouTube'un beklediği formata (H.264 + AAC, FLV, sabit FPS, 2 sn keyframe) dönüştürür.
 */

/** Renderer'dan gelen değerler için kabul edilen aralıklar. */
const limits = {
  width: [128, 3840],
  height: [72, 2160],
  fps: [1, 60],
  videoBitrate: [100, 20000],
  audioBitrate: [32, 320],
}

const allowedProtocols = ['rtmp:', 'rtmps:']

/**
 * ffmpeg binary yolunu bulur. Paketlenmiş uygulamada binary asar dışına (app.asar.unpacked) çıkarılır.
 * LIVETR_FFMPEG_PATH ile farklı bir ffmpeg kullanılabilir.
 */
function resolveFfmpegPath() {
  const customPath = process.env.LIVETR_FFMPEG_PATH
  if (customPath) {
    return customPath
  }

  let binaryPath = null
  try {
    binaryPath = require('ffmpeg-static')
  } catch (_error) {
    return null
  }

  if (!binaryPath) {
    return null
  }

  return binaryPath.replace(/app\.asar([\\/])/, 'app.asar.unpacked$1')
}

function ffmpegExists(binaryPath) {
  try {
    return !!binaryPath && fs.statSync(binaryPath).isFile()
  } catch (_error) {
    return false
  }
}

function toInteger(value, [min, max], name) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Invalid ${name}: ${value}`)
  }

  return Math.round(number)
}

/**
 * Renderer'dan gelen yayın ayarlarını doğrular ve normalize eder.
 * @returns {{ url: string, width: number, height: number, fps: number, videoBitrate: number, audioBitrate: number, record: boolean }}
 */
function normalizeStreamConfig(config) {
  if (!config || typeof config != 'object') {
    throw new Error('Missing stream configuration')
  }

  const url = String(config.url ?? '').trim()
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch (_error) {
    throw new Error('Invalid stream URL')
  }

  if (!allowedProtocols.includes(parsedUrl.protocol) || !parsedUrl.hostname) {
    throw new Error('Stream URL must start with rtmp:// or rtmps://')
  }

  const width = toInteger(config.width, limits.width, 'width')
  const height = toInteger(config.height, limits.height, 'height')

  return {
    url,
    // H.264 (yuv420p) çift sayı boyut ister.
    width: width - (width % 2),
    height: height - (height % 2),
    fps: toInteger(config.fps, limits.fps, 'fps'),
    videoBitrate: toInteger(config.videoBitrate, limits.videoBitrate, 'video bitrate'),
    audioBitrate: toInteger(config.audioBitrate, limits.audioBitrate, 'audio bitrate'),
    record: config.record === true,
  }
}

/**
 * tee muxer'ın slave tanımındaki değerleri kaçışlar (av_get_token kuralları).
 * Tek tırnak içindeki her karakter olduğu gibi alınır; tırnağın kendisi '\'' şeklinde yazılır.
 */
function escapeTeeValue(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`
}

/**
 * ffmpeg argümanlarını üretir.
 * @param {ReturnType<typeof normalizeStreamConfig>} config
 * @param {{ recordPath?: string }} options
 */
function buildFfmpegArgs(config, options = {}) {
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
    // Girdi: MediaRecorder'ın ürettiği canlı Matroska/WebM akışı.
    '-f',
    'matroska',
    '-i',
    'pipe:0',
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    // Görüntü: H.264, sabit FPS, platformların istediği 2 saniyelik keyframe aralığı ve CBR benzeri bitrate.
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
    // Ses: AAC-LC stereo 48 kHz.
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
    // Tek kodlama, iki çıktı: yayın (FLV) + yerel kayıt (MPEG-TS). Kayıt hatası yayını durdurmaz.
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

/**
 * `-progress pipe:1` çıktısını satır satır işler ve her blok tamamlandığında callback'i çağırır.
 */
function createProgressParser(onProgress) {
  let buffer = ''
  let block = {}

  return function write(chunk) {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop()

    for (const line of lines) {
      const index = line.indexOf('=')
      if (index == -1) {
        continue
      }

      const key = line.slice(0, index).trim()
      const value = line.slice(index + 1).trim()
      block[key] = value

      if (key == 'progress') {
        onProgress(toStats(block))
        block = {}
      }
    }
  }
}

function toNumber(value) {
  const number = parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

function toStats(block) {
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

/**
 * ffmpeg stderr satırlarından kullanıcıya gösterilecek en anlamlı hata mesajını seçer.
 */
function extractErrorMessage(lines) {
  const cleaned = lines
    .map((line) => line.replace(/^\[[^\]]+ @ [^\]]+\]\s*/, '').trim())
    .filter((line) => line && !/^\[(info|verbose|debug)\]/.test(line))

  const errors = cleaned.filter((line) => /^\[(error|fatal|panic)\]/.test(line))
  const pick = (errors.length ? errors : cleaned).filter((line) => !/Conversion failed!/i.test(line))
  const message = (pick.length ? pick[pick.length - 1] : cleaned[cleaned.length - 1]) ?? ''

  return message.replace(/^\[(error|fatal|panic|warning)\]\s*/, '')
}

/**
 * Yayın anahtarı gizli bilgidir; hata mesajlarında ve loglarda gösterilmez.
 * Sunucu adresi (protokol, sunucu ve uygulama adı) korunur, geri kalanı maskelenir.
 */
function createSecretMasker(url) {
  let masked = url
  try {
    const parsed = new URL(url)
    const [app] = parsed.pathname.split('/').filter(Boolean)
    masked = `${parsed.protocol}//${parsed.host}/${app ? `${app}/` : ''}****`
  } catch (_error) {}

  const secrets = [url]
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
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
      if (secret && secret.length >= 4) {
        result = result.split(secret).join(index == 0 ? masked : '****')
      }
    }
    return result
  }
}

function timestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}

function recordingFileName(date = new Date()) {
  return `livetr_${timestamp(date)}.ts`
}

module.exports = {
  limits,
  resolveFfmpegPath,
  ffmpegExists,
  normalizeStreamConfig,
  escapeTeeValue,
  buildFfmpegArgs,
  createProgressParser,
  extractErrorMessage,
  createSecretMasker,
  recordingFileName,
}
