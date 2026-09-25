import { isMediaProtocolUrl, mediaPathToUrl } from '@shared/media'

const absolutePathPattern = /^([a-zA-Z]:[\\/]|\\\\|\/)/

/** Yerel dosya yolları (POSIX, Windows, UNC) medya protokolüne çevrilir; URL'ler ve göreli yollar olduğu gibi döner. */
export function localPathToMediaUrl(value: string) {
  return value && absolutePathPattern.test(value) ? mediaPathToUrl(value) : value
}

/** Medya protokolünden gelen kaynaklar canvas'a çizilip ses mikserine bağlandığı için CORS ile yüklenmelidir. */
export function mediaCrossOrigin(url: string | undefined) {
  return url && isMediaProtocolUrl(url) ? 'anonymous' : undefined
}
