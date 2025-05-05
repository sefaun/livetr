import { ref } from 'vue'
import type { TLocalSource } from '@/types'
const { ipcRenderer } = window.require('electron') as typeof import('electron')

const liveCameras = ref<MediaDeviceInfo[]>([])
const liveMedias = ref<TLocalSource[]>([])

export function useLiveMedia() {
  function getLiveCameras() {
    return liveCameras.value
  }

  function getLiveMedias() {
    return liveMedias.value
  }

  async function listCameras() {
    const cameras = await navigator.mediaDevices.enumerateDevices()
    liveCameras.value = cameras.filter((item) => item.kind == 'videoinput' && !isVirtualCamera(item.label))
  }

  async function listLiveMedia() {
    const mediaSources = (await ipcRenderer.invoke('getMediaSources')) as Electron.DesktopCapturerSource[]

    liveMedias.value = mediaSources.map((item) => ({
      id: item.id,
      name: item.name,
      thumbnail: item.thumbnail.toDataURL(),
    }))
  }

  function isVirtualCamera(label: string) {
    const keywords = ['OBS', 'Snap Camera', 'ManyCam', 'Virtual', 'SplitCam', 'XSplit']
    return keywords.some((keyword) => label.toLowerCase().includes(keyword.toLowerCase()))
  }

  function getUserMedia(value: Partial<{ liveId: string; sourceId: string }>) {
    return navigator.mediaDevices.getUserMedia({
      audio: value.liveId
        ? true
        : ({
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: value.sourceId,
            },
          } as any),
      video: value.liveId
        ? { deviceId: { exact: value.liveId } }
        : ({
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: value.sourceId,
            },
          } as any),
    })
  }

  return {
    getLiveCameras,
    getLiveMedias,
    getUserMedia,
    listCameras,
    listLiveMedia,
  }
}
