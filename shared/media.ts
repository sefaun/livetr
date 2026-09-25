export const mediaProtocol = 'livetr-media'

const mediaHost = 'local'

export function mediaPathToUrl(filePath: string): string {
  return `${mediaProtocol}://${mediaHost}/${encodeURIComponent(filePath)}`
}

export function mediaUrlToPath(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol != `${mediaProtocol}:` || parsed.host != mediaHost) {
      return null
    }

    return decodeURIComponent(parsed.pathname.slice(1))
  } catch (_error) {
    return null
  }
}

export function isMediaProtocolUrl(url: string): boolean {
  return url.startsWith(`${mediaProtocol}://`)
}
