<template>
  <div>
    <div
      v-for="node of nodes"
      :id="node.id"
      @click.left="createBackground($event, node)"
      class="w-full flex p-2 border border-gray-300 rounded-md cursor-pointer gap-2"
    >
      <div class="w-12 h-12">
        <MediaRender :type="mediaTypes.img" :src="node.data.src" class="rounded-md" />
      </div>
      <div class="flex items-center">{{ node.data.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDragDrop } from '@/composables/DragDrop'
import { defaultNodes, studioData } from '@/state'
import { mediaTypes, screenNodeTypes } from '@/enums'
import type { TNode } from '@/types'
import MediaRender from '@/components/MediaRender.vue'

const dragdrop = useDragDrop()
const nodes = defaultNodes.filter((item) => item.type == screenNodeTypes.background)

function deleteExistBackground() {
  const backgroundItemIndex = studioData.value.nodes.findIndex((item) => item.type == screenNodeTypes.background)

  if (backgroundItemIndex != -1) {
    studioData.value.nodes.splice(backgroundItemIndex, 1)
  }
}

function createBackground(event: MouseEvent, node: TNode) {
  deleteExistBackground()
  dragdrop.nondragdrop(event, node)
}
</script>
