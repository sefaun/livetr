<template>
  <div class="w-full h-full" :style="styles">{{ (props.data.data as TTextNodeData).text }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { textLineHeight } from '@/enums'
import type { TTextNodeData, TNode } from '@/types'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    required: true,
  },
})

// Satır yüksekliği ve satır sonları yayın canvas'ındaki çizimle aynı olmalı.
const styles = computed(() => {
  const data = props.data.data as TTextNodeData
  return {
    fontSize: `${data.style.fontSize}px`,
    color: data.style.color,
    fontFamily: data.style.fontFamily,
    lineHeight: textLineHeight,
    whiteSpace: 'pre',
  }
})
</script>
