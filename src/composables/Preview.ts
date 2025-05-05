import { ref } from 'vue'
import { ctrlOrMetaKey } from '@/composables/utils'

const canvasPreviewStatus = ref(false)
const videoPreviewStatus = ref(false)

export function usePreview() {
  function getVideoPreviewStatus() {
    return videoPreviewStatus.value
  }

  function getCanvasPreviewStatus() {
    return canvasPreviewStatus.value
  }

  function setVideoPreviewStatus(value: boolean) {
    videoPreviewStatus.value = value
  }

  function setCanvasPreviewStatus(value: boolean) {
    canvasPreviewStatus.value = value
  }

  function previewKeyBoardHandler(event: KeyboardEvent) {
    if (ctrlOrMetaKey(event) && event.code == 'KeyP') {
      event.preventDefault()
      setCanvasPreviewStatus(!getCanvasPreviewStatus())
    }

    if (ctrlOrMetaKey(event) && event.code == 'KeyO') {
      event.preventDefault()
      setVideoPreviewStatus(!getVideoPreviewStatus())
    }
  }

  function startPreviewListener() {
    window.addEventListener('keydown', previewKeyBoardHandler)
  }

  function destroyPreviewListener() {
    window.removeEventListener('keydown', previewKeyBoardHandler)
  }

  return {
    getCanvasPreviewStatus,
    getVideoPreviewStatus,
    setCanvasPreviewStatus,
    setVideoPreviewStatus,
    startPreviewListener,
    destroyPreviewListener,
  }
}
