import type { Ref } from 'vue'
import { ref } from 'vue'
import { screenNodeTypes } from '@/enums'
import type { TChannels, TNode, TuseNode } from '@/types'

export const canvasRef = ref<HTMLCanvasElement>()
export const screenRef = ref<HTMLElement>()

export const channel = ref<TChannels>()
export const nodes: Ref<Record<string, TuseNode>> = ref({})
export const studioData = ref({
  nodes: [] as TNode[],
})

export const defaultNodes = [
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
      src: 'https://www.klasiksanatlar.com/img/sayfalar/b/1_1598452306_resim.png',
    },
  },
  // {
  //   id: window.crypto.randomUUID(),
  //   type: screenNodeTypes.video,
  //   position: {
  //     x: 0,
  //     y: 0,
  //   },
  //   style: {
  //     width: '150px',
  //     height: '150px',
  //   },
  //   data: {
  //     title: 'Klasik Video',
  //     src: '../../../assets/bigbuckbunny.mp4',
  //   },
  // },
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
      src: 'https://www.manzara.gen.tr/w1/Güzel-Resimler-28.jpg',
    },
  },
]
