import type { Ref } from 'vue'
import { ref } from 'vue'
import { screenNodeTypes } from '@/enums'
import type { TChannels, TNode, TuseNode } from '@/types'
import testBgImage from '@/assets/test-bg-image.jpg'
import testImage from '@/assets/test-image.png'
import testVideo from '@/assets/bigbuckbunny.mp4'

export const canvasPreviewRef = ref<HTMLCanvasElement>()
export const videoPreviewRef = ref<HTMLVideoElement>()
export const screenRef = ref<HTMLElement>()

export const channel = ref<TChannels>()
export const nodes: Ref<Record<string, TuseNode>> = ref({})
export const studioData = ref({
  nodes: [] as TNode[],
})
export const defaultNodes = ref([
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
      src: testImage,
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
      src: testVideo,
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
      src: testBgImage,
    },
  },
])
