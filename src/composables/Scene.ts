import { useFile } from '@/composables/File'
import { activeScene, canvasPreviewRef, studioData } from '@/state'
import { filePaths } from '@/enums'

export function useScene() {
  const file = useFile()

  function saveActiveScreen() {
    const base64Data = canvasPreviewRef.value.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
    file.fs.writeFileSync(
      `${file.getDirectoryFromMainFolder(filePaths.scene)}/${studioData.value.scene[activeScene.value].sceneId}.png`,
      Buffer.from(base64Data, 'base64')
    )
  }

  return {
    saveActiveScreen,
  }
}
