import type { Ref } from 'vue'
import { ref } from 'vue'
import type { TNode, TuseNode } from '@/types'

export const screenRef = ref<HTMLElement>()

export const studioData = ref({
  nodes: [] as TNode[],
})
export const nodes: Ref<Record<string, TuseNode>> = ref({})
