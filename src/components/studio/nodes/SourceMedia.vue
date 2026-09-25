<template>
  <div class="w-full h-full">
    <LiveMediaRender :sourceId="sourceId" autoplay muted class="object-fill" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { TSourceMediaNodeData, TNode } from '@/types'
import LiveMediaRender from '@/components/LiveMediaRender.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    required: true,
  },
})

const sourceId = (props.data.data as TSourceMediaNodeData).id
</script>
