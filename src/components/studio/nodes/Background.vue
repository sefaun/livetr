<template>
  <div class="w-full h-full">
    <MediaRender :src="src" class="w-full h-full object-fill" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import type { TBackgroundNodeData, TNode } from '@/types'
import MediaRender from '@/components/MediaRender.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    required: true,
  },
})

const src = computed(() => (props.data.data as TBackgroundNodeData).src)
</script>
