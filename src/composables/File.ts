import type { OpenDialogReturnValue } from 'electron'
import { defaultNodes } from '@/state'
import { screenNodeTypes } from '@/enums'
const fs = window.require('node:fs') as typeof import('node:fs')
const path = window.require('node:path') as typeof import('node:path')
const { ipcRenderer } = window.require('electron') as typeof import('electron')

export function useFile() {
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

      defaultNodes.value.push({
        id: window.crypto.randomUUID(),
        type: type,
        position: {
          x: 0,
          y: 0,
        },
        style: {
          width: '150px',
          height: '150px',
        },
        data: {
          title: fileName,
          src: directorySplit.join('/'),
        },
      })
    }
  }

  function setBackgroundStore() {}

  function setVideoStore() {}

  // async function name() {
  //   try {
  //     const result = await ipcRenderer.invoke('exportAsJSONLadderData')

  //     if (result.canceled) {
  //       return
  //     }

  //     fs.writeFileSync(result.filePath, JSON.stringify(ladderExport.exportJSON(), null, 2), 'utf8')

  //     new window.Notification(t('saved'))
  //   } catch (error) {
  //     new window.Notification(t('not_saved'), {
  //       body: (error as Error).message,
  //     })
  //   }
  // }

  return {
    getDirectoryFromMainFolder,
    setImageStore,
    setBackgroundStore,
    setVideoStore,
    readFile: fs.readFileSync,
  }
}
