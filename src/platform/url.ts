const windowsDrivePattern = /^[a-zA-Z]:[\\/]/
const schemePattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/

function encodeSegments(segments: string[]) {
  return segments.map((segment) => encodeURIComponent(segment)).join('/')
}

/**
 * Yerel dosya yolunu `file://` URL'sine çevirir (Windows, UNC ve POSIX yolları).
 * Boşluk, `#`, `?`, `%` ve Türkçe karakter içeren dosya adları da doğru çalışır.
 * Zaten URL olan değerler (http, blob, data, file...) ve göreli yollar olduğu gibi döner.
 */
export function filePathToUrl(value: string) {
  if (!value) {
    return value
  }

  if (windowsDrivePattern.test(value)) {
    const [drive, ...segments] = value.replace(/\\/g, '/').split('/')
    return `file:///${drive}/${encodeSegments(segments)}`
  }

  if (schemePattern.test(value)) {
    return value
  }

  if (value.startsWith('\\\\') || value.startsWith('//')) {
    const [host, ...segments] = value.replace(/\\/g, '/').replace(/^\/+/, '').split('/')
    return `file://${host}/${encodeSegments(segments)}`
  }

  if (value.startsWith('/')) {
    return `file://${encodeSegments(value.split('/'))}`
  }

  return value
}
