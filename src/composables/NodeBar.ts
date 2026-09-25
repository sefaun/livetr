import { platform } from '@/platform'
import { notify } from '@/composables/Notify'
import { clone, errorMessage } from '@/composables/utils'
import { defaultNodes } from '@/state'
import { nodeData, screenNodeTypes } from '@/enums'
import type { TMediaKind } from '@/platform/types'
import type { TNode, TScreenNodeTypes, TTextNodeData } from '@/types'

function createNode(type: TScreenNodeTypes, data: TNode['data'], style: TNode['style']) {
  const nodeContent = clone(nodeData)

  nodeContent.id = window.crypto.randomUUID()
  nodeContent.type = type
  nodeContent.data = data
  nodeContent.style = style

  return nodeContent
}

/** Node bar'a (sağ panel) yeni metin ve medya öğeleri ekler. Değişiklikler otomatik kaydedilir. */
export function useNodeBar() {
  async function pickFiles(kind: TMediaKind) {
    try {
      return await platform.pickMedia(kind)
    } catch (error) {
      notify('error', errorMessage(error))
      return []
    }
  }

  function setTextStore(data: TTextNodeData) {
    defaultNodes.value.push(
      createNode(screenNodeTypes.text, data, {
        width: 'fit-content',
        height: 'fit-content',
      })
    )
  }

  async function setImageStore(type: typeof screenNodeTypes.image | typeof screenNodeTypes.background) {
    for (const file of await pickFiles('image')) {
      defaultNodes.value.push(
        createNode(
          type,
          { title: file.name, src: file.path },
          {
            width: type == screenNodeTypes.image ? '150px' : '100%',
            height: type == screenNodeTypes.image ? '150px' : '100%',
          }
        )
      )
    }
  }

  async function setVideoStore() {
    for (const file of await pickFiles('video')) {
      defaultNodes.value.push(
        createNode(screenNodeTypes.video, { title: file.name, src: file.path }, { width: '150px', height: '150px' })
      )
    }
  }

  async function setBackgroundSoundStore() {
    for (const file of await pickFiles('audio')) {
      defaultNodes.value.push(createNode(screenNodeTypes.backgroundSound, { title: file.name, src: file.path }, {}))
    }
  }

  return {
    setTextStore,
    setImageStore,
    setVideoStore,
    setBackgroundSoundStore,
  }
}
