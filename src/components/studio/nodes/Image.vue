<template>
  <div class="w-full h-full">
    <MediaRender :type="mediaTypes.img" :src="props.data.data.src" :iconSize="50" iconColor="white" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { mediaTypes } from '@/enums'
import type { TNode } from '@/types'
import MediaRender from '@/components/MediaRender.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})
</script>
