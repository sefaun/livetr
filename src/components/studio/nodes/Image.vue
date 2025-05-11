<template>
  <div class="w-full h-full">
    <MediaRender :src="src" class="w-full h-full object-fill" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { TImageNodeData, TNode } from '@/types'
import MediaRender from '@/components/MediaRender.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const src = ref((props.data.data as TImageNodeData).src)
</script>
