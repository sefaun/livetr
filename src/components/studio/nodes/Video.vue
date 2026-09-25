<template>
  <div class="w-full h-full">
    <LiveMediaRender :src="src" controls class="object-fill" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import type { TVideoNodeData, TNode } from '@/types'
import LiveMediaRender from '@/components/LiveMediaRender.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    required: true,
  },
})

const src = computed(() => (props.data.data as TVideoNodeData).src)
</script>
