<template>
  <div class="w-full h-full">
    <pre :style="styles">
      {{ (props.data.data as TTextNodeData).text }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { TTextNodeData, TNode } from '@/types'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const styles = computed(() => {
  const data = props.data.data as TTextNodeData
  return {
    fontSize: `${data.fontSize}px`,
    color: data.color,
    fontFamily: data.fontFamily,
  }
})
</script>
