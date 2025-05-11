import type { OpenDialogReturnValue } from 'electron'
import { useI18n } from 'vue-i18n'
import { cloneDeep } from 'lodash'
import { isJSON } from '@/composables/utils'
import { defaultNodes } from '@/state'
import { filePaths, mainFilePath, nodeData, screenNodeTypes } from '@/enums'
const fs = window.require('node:fs') as typeof import('node:fs')
const path = window.require('node:path') as typeof import('node:path')
const { ipcRenderer } = window.require('electron') as typeof import('electron')

export function useFile() {
  const { t } = useI18n()

  function getDirectoryFromMainFolder(way: string) {
    return path.resolve(process.cwd(), way)
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

    exportDefaultNodes()
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

    exportDefaultNodes()
  }

  function exportDefaultNodes(notify: boolean = false) {
    try {
      fs.writeFileSync(
        getDirectoryFromMainFolder(filePaths.nodebar),
        JSON.stringify(defaultNodes.value, null, 2),
        'utf8'
      )

      if (notify) {
        new window.Notification(t('saved'))
      }
    } catch (error) {
      if (notify) {
        new window.Notification(t('not_saved'), {
          body: (error as Error).message,
        })
      }
      console.log(error)
    }
  }

  function setDefaultNodes() {
    const file = fs.readFileSync(getDirectoryFromMainFolder(filePaths.nodebar)).toString()
    if (!isJSON(file)) {
      throw new window.Notification(t('wrong_file_content'))
    }

    defaultNodes.value = JSON.parse(file)
  }

  function createDefaultDirs() {
    if (!fs.existsSync(getDirectoryFromMainFolder(mainFilePath))) {
      fs.mkdirSync(mainFilePath)
    }

    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.nodebar))) {
      fs.writeFileSync(getDirectoryFromMainFolder(filePaths.nodebar), JSON.stringify(defaultNodes.value))
    }
  }

  return {
    getDirectoryFromMainFolder,
    setDefaultNodes,
    setImageStore,
    setVideoStore,
    createDefaultDirs,
    exportDefaultNodes,
    readFile: fs.readFileSync,
  }
}
