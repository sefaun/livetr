import { useI18n } from 'vue-i18n'
import { isJSON } from '@/composables/utils'
import { defaultNodes, studioData } from '@/state'
import { filePaths, mainFilePath, screenNodeTypes } from '@/enums'
import DefaultScene from '@/assets/default-scene.png'
import TestBgImage from '@/assets/test-bg-image.jpg'
import TestImage from '@/assets/test-image.png'
import TestVideo from '@/assets/bigbuckbunny.mp4'
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
        default: true,
      },
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
          text: 'Test - 2 🔥',
          style: {
            color: '#000000',
            fontSize: 24,
            fontFamily: 'Arial',
          },
        },
        default: true,
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
        default: true,
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
        default: true,
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
        default: true,
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
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.defaultScenePng))) {
      fs.writeFileSync(filePaths.defaultScenePng, fs.readFileSync(getDirectoryFromMainFolder(DefaultScene)))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.testBgImagePng))) {
      fs.writeFileSync(filePaths.testBgImagePng, fs.readFileSync(getDirectoryFromMainFolder(TestBgImage)))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.testImagePng))) {
      fs.writeFileSync(filePaths.testImagePng, fs.readFileSync(getDirectoryFromMainFolder(TestImage)))
    }
    if (!fs.existsSync(getDirectoryFromMainFolder(filePaths.testVideoMp4))) {
      fs.writeFileSync(filePaths.testVideoMp4, fs.readFileSync(getDirectoryFromMainFolder(TestVideo)))
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
