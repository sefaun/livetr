import { useI18n } from 'vue-i18n'
import { isJSON } from '@/composables/utils'
import { defaultNodes, studioData } from '@/state'
import { filePaths, mainFilePath } from '@/enums'
const fs = window.require('node:fs') as typeof import('node:fs')
const path = window.require('node:path') as typeof import('node:path')

export function useFile() {
  const { t } = useI18n()

  function getDirectoryFromMainFolder(way: string) {
    return path.join(process.cwd(), way)
  }

  function getDefaultNodes() {
    const file = fs.readFileSync(getDirectoryFromMainFolder(filePaths.nodebar)).toString()
    if (!isJSON(file)) {
      throw new window.Notification(t('wrong_file_content'))
    }

    defaultNodes.value = JSON.parse(file)
  }

  function getStudioData() {
    const file = fs.readFileSync(getDirectoryFromMainFolder(filePaths.studio)).toString()
    if (!isJSON(file)) {
      throw new window.Notification(t('wrong_file_content'))
    }

    studioData.value = JSON.parse(file)
  }

  function setDefaultNodes(notify: boolean = false) {
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

  function setStudioData(notify: boolean = false) {
    try {
      fs.writeFileSync(getDirectoryFromMainFolder(filePaths.studio), JSON.stringify(studioData.value, null, 2), 'utf8')

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

  function createDefaultDirs() {
    if (!fs.existsSync(getDirectoryFromMainFolder(mainFilePath))) {
      fs.mkdirSync(mainFilePath)
    }

    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.nodebar))) {
      fs.writeFileSync(getDirectoryFromMainFolder(filePaths.nodebar), JSON.stringify(defaultNodes.value))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.studio))) {
      fs.writeFileSync(getDirectoryFromMainFolder(filePaths.studio), JSON.stringify(studioData.value))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.scene))) {
      fs.mkdirSync(filePaths.scene)
    }
  }

  return {
    fs,
    createDefaultDirs,
    getDirectoryFromMainFolder,
    getStudioData,
    getDefaultNodes,
    setDefaultNodes,
    setStudioData,
  }
}
