import type { TDesktopApi, TDesktopSource, TMediaKind, TPickedFile } from '@shared/ipc'

// Renderer ile ana süreç arasındaki sözleşme tipleri shared/ipc.ts içinde tanımlıdır.
export type {
  TDesktopApi,
  TDesktopSource,
  TMediaKind,
  TPickedFile,
  TStoreNotice,
  TStoreSnapshot,
  TStreamConfig,
  TStreamEvent,
  TStreamState,
  TStreamStats,
} from '@shared/ipc'

export type TStoreApi = TDesktopApi['store']
export type TStreamApi = TDesktopApi['stream']

/**
 * Uygulamanın çalıştığı ortamın (masaüstü veya tarayıcı) ortak arayüzü.
 * Bileşenler Electron API'lerine doğrudan değil, bu arayüz üzerinden erişir.
 */
export type TPlatform = {
  isDesktop: boolean
  store: TStoreApi
  /** Canlı yayın sadece masaüstünde (ffmpeg) mümkündür; web ortamında `null`. */
  stream: TStreamApi | null
  pickMedia(kind: TMediaKind): Promise<TPickedFile[]>
  getDesktopSources(): Promise<TDesktopSource[]>
  setLocale(locale: string): void
  /** Kayıtlı medya yolunu (dosya yolu veya URL) `<img>`/`<video>` için kullanılabilir URL'ye çevirir. */
  toMediaUrl(src: string): string
}
