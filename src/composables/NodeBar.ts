import { cloneDeep } from 'lodash'
import type { OpenDialogReturnValue } from 'electron'
import { useFile } from '@/composables/File'
import { defaultNodes } from '@/state'
import { nodeData, screenNodeTypes } from '@/enums'
import type { TTextNodeData } from '@/types'
const { ipcRenderer } = window.require('electron') as typeof import('electron')

export function useNodeBar() {
  const file = useFile()

  async function setTextStore(data: TTextNodeData) {
    const nodeContent = cloneDeep(nodeData)

    nodeContent.id = window.crypto.randomUUID() as string
    nodeContent.type = screenNodeTypes.text
    nodeContent.data = data
    nodeContent.style = {
      width: 'fit-content',
      height: 'fit-content',
    }

    defaultNodes.value.push(nodeContent)

    file.setDefaultNodes()
  }

  async function setImageStore(type: typeof screenNodeTypes.image | typeof screenNodeTypes.background) {
    const result = (await ipcRenderer.invoke('selectImage')) as OpenDialogReturnValue

    if (result.canceled) {
      return
    }

    for (const item of result.filePaths) {
      const directorySplit = item.split('\\')
      const fileName = directorySplit[directorySplit.length - 1]
      const nodeContent = cloneDeep(nodeData)

      nodeContent.id = window.crypto.randomUUID() as string
      nodeContent.type = type
      nodeContent.data = {
        title: fileName,
        src: directorySplit.join('/'),
      }
      nodeContent.style = {
        width: type == screenNodeTypes.image ? '150px' : '100%',
        height: type == screenNodeTypes.image ? '150px' : '100%',
      }

      defaultNodes.value.push(nodeContent)
    }

    file.setDefaultNodes()
  }

  async function setVideoStore() {
    const result = (await ipcRenderer.invoke('selectVideo')) as OpenDialogReturnValue

    if (result.canceled) {
      return
    }

    for (const item of result.filePaths) {
      const directorySplit = item.split('\\')
      const fileName = directorySplit[directorySplit.length - 1]
      const nodeContent = cloneDeep(nodeData)

      nodeContent.id = window.crypto.randomUUID() as string
      nodeContent.type = screenNodeTypes.video
      nodeContent.data = {
        title: fileName,
        src: directorySplit.join('/'),
      }
      nodeContent.style = {
        width: '150px',
        height: '150px',
      }

      defaultNodes.value.push(nodeContent)
    }

    file.setDefaultNodes()
  }

  return {
    setTextStore,
    setImageStore,
    setVideoStore,
  }
}
