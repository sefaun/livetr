<template>
  <div class="absolute w-full flex justify-end items-center top-1 right-1 gap-1">
    <ElButton
      :icon="Delete"
      @mousedown.stop
      @click.stop.left="removeNode()"
      class="!h-auto !p-1 !ml-0 !text-xs"
      type="danger"
    ></ElButton>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { studioData } from '@/state'

const props = defineProps({
  nodeId: {
    type: String,
    default: '',
    required: true,
  },
})

function removeNode() {
  const index = studioData.value.nodes.findIndex((item) => item.id == props.nodeId)
  studioData.value.nodes.splice(index, 1)
}
</script>
