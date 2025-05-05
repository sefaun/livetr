<template>
  <div class="w-full h-full">
    <LiveMedia :src="src" controls muted class="object-fill" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { TImageNodeData, TNode } from '@/types'
import LiveMedia from '@/components/LiveMedia.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const src = ref((props.data.data as TImageNodeData).src)
</script>
