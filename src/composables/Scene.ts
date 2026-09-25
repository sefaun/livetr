import { ref } from 'vue'
import { platform } from '@/platform'
import { activeScene, canvasPreviewRef, studioData } from '@/state'

export const thumbnailSize = {
  width: 320,
  height: 180,
} as const

/** Sahne küçük resimleri (sceneId -> data URL). Kaydedilen resim diskten tekrar okunmadan kullanılır. */
const thumbnails = ref<Record<string, string>>({})

function dataUrlToBytes(dataUrl: string) {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes.buffer
}

export function useScene() {
  /**
   * Aktif sahnenin küçük resmini kaydeder. Yayın canvas'ının tamamı yerine küçültülmüş bir kopyası
   * kodlandığı için ana iş parçacığı (ve dolayısıyla yayın) takılmaz.
   */
  async function saveActiveScreen() {
    const canvas = canvasPreviewRef.value
    const sceneId = studioData.value.scene[activeScene.value]?.sceneId
    if (!canvas || !sceneId) {
      return
    }

    const thumbnail = document.createElement('canvas')
    thumbnail.width = thumbnailSize.width
    thumbnail.height = thumbnailSize.height
    thumbnail.getContext('2d').drawImage(canvas, 0, 0, thumbnail.width, thumbnail.height)

    const dataUrl = thumbnail.toDataURL('image/png')
    thumbnails.value[sceneId] = dataUrl

    try {
      await platform.store.saveSceneThumbnail(sceneId, dataUrlToBytes(dataUrl))
    } catch (error) {
      console.warn('[scene] thumbnail could not be saved', error)
    }
  }

  async function getThumbnail(sceneId: string) {
    if (!thumbnails.value[sceneId]) {
      try {
        const dataUrl = await platform.store.readSceneThumbnail(sceneId)
        if (dataUrl) {
          thumbnails.value[sceneId] = dataUrl
        }
      } catch (error) {
        console.warn('[scene] thumbnail could not be read', error)
      }
    }

    return thumbnails.value[sceneId] ?? null
  }

  async function removeThumbnail(sceneId: string) {
    delete thumbnails.value[sceneId]
    try {
      await platform.store.removeSceneThumbnail(sceneId)
    } catch (error) {
      console.warn('[scene] thumbnail could not be removed', error)
    }
  }

  return {
    saveActiveScreen,
    getThumbnail,
    removeThumbnail,
  }
}
