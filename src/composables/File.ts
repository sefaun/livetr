import { useI18n } from 'vue-i18n'
import { isJSON } from '@/composables/utils'
import { defaultNodes, studioData } from '@/state'
import { filePaths, mainFilePath, screenNodeTypes } from '@/enums'
const fs = window.require('node:fs') as typeof import('node:fs')
const path = window.require('node:path') as typeof import('node:path')

export function useFile() {
  const { t } = useI18n()

  function getDirectoryFromMainFolder(way: string) {
    return path.join(process.cwd(), way)
  }

  function getDefaultNodes() {
    const file = fs.readFileSync(getDirectoryFromMainFolder(filePaths.nodebarJson)).toString()
    if (!isJSON(file)) {
      throw new window.Notification(t('wrong_file_content'))
    }

    defaultNodes.value = JSON.parse(file)
  }

  function getStudioData() {
    const file = fs.readFileSync(getDirectoryFromMainFolder(filePaths.studioJson)).toString()
    if (!isJSON(file)) {
      throw new window.Notification(t('wrong_file_content'))
    }

    studioData.value = JSON.parse(file)
  }

  function setDefaultNodes(notify: boolean = false) {
    try {
      fs.writeFileSync(
        getDirectoryFromMainFolder(filePaths.nodebarJson),
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
      fs.writeFileSync(
        getDirectoryFromMainFolder(filePaths.studioJson),
        JSON.stringify(studioData.value, null, 2),
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

  function getDefaultNodeValues() {
    return [
      {
        id: window.crypto.randomUUID(),
        type: screenNodeTypes.text,
        position: {
          x: 0,
          y: 0,
        },
        style: {
          width: 'fit-content',
          height: 'fit-content',
        },
        data: {
          text: 'Test - 1 😊',
          style: {
            color: '#000000',
            fontSize: 24,
            fontFamily: 'Arial',
          },
        },
      },
      {
        id: window.crypto.randomUUID(),
        type: screenNodeTypes.image,
        position: {
          x: 0,
          y: 0,
        },
        style: {
          width: '150px',
          height: '150px',
        },
        data: {
          title: 'Klasik Resim',
          src: getDirectoryFromMainFolder(filePaths.testImagePng),
        },
      },
      {
        id: window.crypto.randomUUID(),
        type: screenNodeTypes.video,
        position: {
          x: 0,
          y: 0,
        },
        style: {
          width: '150px',
          height: '150px',
        },
        data: {
          title: 'Test Video',
          src: getDirectoryFromMainFolder(filePaths.testVideoMp4),
        },
      },
      {
        id: window.crypto.randomUUID(),
        type: screenNodeTypes.background,
        position: {
          x: 0,
          y: 0,
        },
        style: {
          width: '100%',
          height: '100%',
        },
        data: {
          title: 'Arka Plan',
          src: getDirectoryFromMainFolder(filePaths.testBgImagePng),
        },
      },
      {
        id: window.crypto.randomUUID(),
        type: screenNodeTypes.backgroundSound,
        position: {
          x: 0,
          y: 0,
        },
        style: {},
        data: {
          title: 'Arka Plan Test Sesi',
          src: getDirectoryFromMainFolder(filePaths.testAudioMp3),
        },
      },
    ]
  }

  function createDefaultDirs() {
    if (!fs.existsSync(getDirectoryFromMainFolder(mainFilePath))) {
      fs.mkdirSync(mainFilePath)
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.nodebarJson))) {
      fs.writeFileSync(getDirectoryFromMainFolder(filePaths.nodebarJson), JSON.stringify(getDefaultNodeValues()))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.studioJson))) {
      fs.writeFileSync(getDirectoryFromMainFolder(filePaths.studioJson), JSON.stringify(studioData.value))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.scene))) {
      fs.mkdirSync(filePaths.scene)
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.nodebar))) {
      fs.mkdirSync(filePaths.nodebar)
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
