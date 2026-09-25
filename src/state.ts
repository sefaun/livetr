import { ref } from 'vue'
import type { TChannels, TNode, TStudioData, TuseNode } from '@/types'

/** Yayına giden görüntünün çizildiği canvas. */
export const canvasPreviewRef = ref<HTMLCanvasElement>()
export const videoPreviewRef = ref<HTMLVideoElement>()
/** Editördeki sahne alanı (mantıksal koordinatlar, CSS ile ölçeklenir). */
export const screenRef = ref<HTMLElement>()
/** Sahne alanının ekrandaki ölçeği (ekran pikseli / mantıksal piksel). */
export const stageScale = ref(1)

export const channel = ref<TChannels>()
/** Sahnede mount edilmiş node'lar. Sadece canvas çizimi için kullanılır, reaktif değildir. */
export const nodeRegistry = new Map<string, TuseNode>()
export const activeScene = ref(0)
export const defaultNodes = ref<TNode[]>([])
export const studioData = ref<TStudioData>({
  scene: [
    {
      sceneId: window.crypto.randomUUID(),
      nodes: [],
    },
  ],
})
