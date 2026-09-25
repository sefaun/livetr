import { protocol } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { mediaProtocol, mediaUrlToPath } from '../shared/media.js'

const mimeTypes: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.ogg': 'application/ogg',
  '.oga': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
}

type TByteRange = { start: number; end: number }

function parseRange(header: string, size: number): TByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match || (!match[1] && !match[2])) {
    return null
  }

  let start: number
  let end: number
  if (match[1]) {
    start = Number(match[1])
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  } else {
    start = Math.max(0, size - Number(match[2]))
    end = size - 1
  }

  return start <= end && start < size ? { start, end } : null
}

function errorResponse(status: number): Response {
  return new Response(null, { status, headers: { 'Access-Control-Allow-Origin': '*' } })
}

async function serveMedia(request: Request): Promise<Response> {
  const filePath = mediaUrlToPath(request.url)
  const mimeType = filePath ? mimeTypes[path.extname(filePath).toLowerCase()] : undefined
  if (!filePath || !path.isAbsolute(filePath) || !mimeType) {
    return errorResponse(400)
  }

  let stat: fs.Stats
  try {
    stat = await fs.promises.stat(filePath)
  } catch (_error) {
    return errorResponse(404)
  }

  if (!stat.isFile()) {
    return errorResponse(404)
  }

  const headers: Record<string, string> = {
    'Content-Type': mimeType,
    'Accept-Ranges': 'bytes',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  }

  const rangeHeader = request.headers.get('Range')
  if (!rangeHeader) {
    const body = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream<Uint8Array>
    return new Response(body, { status: 200, headers: { ...headers, 'Content-Length': String(stat.size) } })
  }

  const range = parseRange(rangeHeader, stat.size)
  if (!range) {
    return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${stat.size}` } })
  }

  const body = Readable.toWeb(fs.createReadStream(filePath, range)) as ReadableStream<Uint8Array>
  return new Response(body, {
    status: 206,
    headers: {
      ...headers,
      'Content-Range': `bytes ${range.start}-${range.end}/${stat.size}`,
      'Content-Length': String(range.end - range.start + 1),
    },
  })
}

/** Uygulama hazır olmadan önce çağrılmalıdır. */
export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: mediaProtocol,
      privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
    },
  ])
}

export function handleMediaProtocol(): void {
  protocol.handle(mediaProtocol, serveMedia)
}
