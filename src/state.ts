import type { Ref } from 'vue'
import { ref } from 'vue'
import type { TuseNode } from '@/types'

export const screenRef = ref()

export const nodes: Ref<Record<string, TuseNode>> = ref({})
