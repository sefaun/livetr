<template>
  <div class="w-full h-full">
    <LiveMediaRender :liveId="liveId" autoplay muted class="object-fill" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { TLiveCameraNodeData, TNode } from '@/types'
import LiveMediaRender from '@/components/LiveMediaRender.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    required: true,
  },
})

const liveId = (props.data.data as TLiveCameraNodeData).id
</script>
