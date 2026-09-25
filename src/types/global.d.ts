import type { TDesktopApi } from '@/platform/types'

declare global {
  interface Window {
    /** Sadece masaüstü (Electron) uygulamasında tanımlıdır. */
    livetr?: TDesktopApi
  }
}

export {}
