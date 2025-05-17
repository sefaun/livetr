import type { Ref } from 'vue'
import { ref } from 'vue'
import { screenNodeTypes } from '@/enums'
import type { TChannels, TNode, TuseNode } from '@/types'

export const canvasPreviewRef = ref<HTMLCanvasElement>()
export const videoPreviewRef = ref<HTMLVideoElement>()
export const screenRef = ref<HTMLElement>()

export const channel = ref<TChannels>()
export const nodes: Ref<Record<string, TuseNode>> = ref({})
export const activeSceneSrc = ref('')
export const activeScene = ref(0)
export const studioData = ref({
  scene: [
    {
      sceneId: window.crypto.randomUUID(),
      nodes: [],
    },
  ] as [
    {
      sceneId: string
      nodes: TNode[]
    }
  ],
})
export const defaultNodes = ref<TNode[]>([
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
      color: '#000000',
      fontSize: 24,
      fontFamily: 'Arial',
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
      color: '#000000',
      fontSize: 24,
      fontFamily: 'Arial',
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
      src: 'src/assets/test-image.png',
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
      src: 'src/assets/bigbuckbunny.mp4',
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
      src: 'src/assets/test-bg-image.jpg',
    },
    default: true,
  },
])
