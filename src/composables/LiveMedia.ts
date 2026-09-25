import { ref } from 'vue'
import { platform } from '@/platform'
import type { TDesktopSource } from '@/platform/types'

const liveCameras = ref<MediaDeviceInfo[]>([])
const liveMedias = ref<TDesktopSource[]>([])

type TLiveSource = Partial<{ liveId: string; sourceId: string }>
type TCaptureOptions = { audio?: boolean; fps?: number; preview?: boolean }

export function useLiveMedia() {
  function getLiveCameras() {
    return liveCameras.value
  }

  function getLiveMedias() {
    return liveMedias.value
  }

  async function listCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      liveCameras.value = devices.filter(
        (item) => item.kind == 'videoinput' && item.deviceId && !isVirtualCamera(item.label)
      )
    } catch (error) {
      console.warn('[media] cameras could not be listed', error)
      liveCameras.value = []
    }
  }

  async function listLiveMedia() {
    try {
      liveMedias.value = await platform.getDesktopSources()
    } catch (error) {
      console.warn('[media] desktop sources could not be listed', error)
      liveMedias.value = []
    }
  }

  function isVirtualCamera(label: string) {
    const keywords = ['OBS', 'Snap Camera', 'ManyCam', 'Virtual', 'SplitCam', 'XSplit']
    return keywords.some((keyword) => label.toLowerCase().includes(keyword.toLowerCase()))
  }

  function videoConstraints(source: TLiveSource, options: TCaptureOptions): any {
    const fps = options.fps ?? 30

    if (source.liveId) {
      // Kameralar varsayılan olarak 640x480 açılır; yayın için yüksek çözünürlük istenir.
      return options.preview
        ? { deviceId: { exact: source.liveId }, width: { ideal: 320 }, height: { ideal: 180 } }
        : {
            deviceId: { exact: source.liveId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: fps },
          }
    }

    return {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.sourceId,
        maxWidth: 1920,
        maxHeight: 1080,
        maxFrameRate: fps,
      },
    }
  }

  function audioConstraints(source: TLiveSource): any {
    return source.liveId
      ? true
      : {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.sourceId,
          },
        }
  }

  /**
   * Kamera (liveId) veya ekran/pencere (sourceId) görüntüsünü açar.
   * Ses alınamazsa (mikrofon yok, işletim sistemi ekran sesini desteklemiyor vb.) sadece görüntü ile devam edilir.
   */
  async function getUserMedia(source: TLiveSource, options: TCaptureOptions = {}) {
    const video = videoConstraints(source, options)

    if (options.audio !== false) {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: audioConstraints(source), video })
      } catch (error) {
        console.warn('[media] audio could not be captured, continuing with video only', error)
      }
    }

    return navigator.mediaDevices.getUserMedia({ audio: false, video })
  }

  return {
    getLiveCameras,
    getLiveMedias,
    getUserMedia,
    listCameras,
    listLiveMedia,
  }
}
