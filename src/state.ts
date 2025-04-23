import type { Ref } from 'vue'
import { ref } from 'vue'
import type { TNode, TuseNode } from '@/types'
import { screenNodeTypes } from '@/enums'

export const screenRef = ref<HTMLElement>()

export const studioData = ref({
  nodes: [] as TNode[],
})
export const nodes: Ref<Record<string, TuseNode>> = ref({})

export const defaultNodes = [
  {
    id: window.crypto.randomUUID(),
    type: screenNodeTypes.image,
    position: {
      x: 0,
      y: 0,
    },
    style: {
      zIndex: '1000',
      width: '150px',
      height: '150px',
    },
    data: {
      title: 'Klasik Sanatlar',
      src: 'https://www.klasiksanatlar.com/img/sayfalar/b/1_1598452306_resim.png',
    },
  },
]
