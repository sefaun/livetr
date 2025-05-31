import type { Ref } from 'vue'
import { ref } from 'vue'
import type { TChannels, TNode, TuseNode } from '@/types'

export const canvasPreviewRef = ref<HTMLCanvasElement>()
export const videoPreviewRef = ref<HTMLVideoElement>()
export const screenRef = ref<HTMLElement>()

export const channel = ref<TChannels>()
export const nodes: Ref<Record<string, TuseNode>> = ref({})
export const activeSceneSrc = ref('')
export const activeScene = ref(0)
export const defaultNodes = ref<TNode[]>([])
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
