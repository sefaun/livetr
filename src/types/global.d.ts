import type { TDesktopApi } from '@shared/ipc'

declare global {
  interface Window {
    /** Sadece masaüstü (Electron) uygulamasında tanımlıdır. */
    livetr?: TDesktopApi
  }
}

export {}
