import { localPathToMediaUrl } from '@/platform/url'
import type { TDesktopApi, TPlatform } from '@/platform/types'

/** Electron içinde çalışırken preload köprüsünü kullanan platform. */
export function createDesktopPlatform(api: TDesktopApi): TPlatform {
  return {
    isDesktop: true,
    store: api.store,
    stream: api.stream,
    pickMedia: (kind) => api.dialog.openMedia(kind),
    getDesktopSources: () => api.media.getDesktopSources(),
    setLocale: (locale) => api.app.setLocale(locale),
    toMediaUrl: localPathToMediaUrl,
  }
}
