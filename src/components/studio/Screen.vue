<template>
  <div
    ref="screenRef"
    @dragenter.prevent="dragdrop.dragenter"
    @dragover.prevent="dragdrop.dragover"
    @dragleave="dragdrop.dragleave"
    @drop.prevent="dragdrop.drop"
    class="relative w-full bg-black border border-[var(--wire-color)] dark:border-[--wire-dark-color] aspect-video shadow-[0_0_10px_var(--wire-color)] dark:shadow-[0_0_10px_var(--wire-dark-color)]"
  >
    <Node v-for="node of studioData.nodes" :data="node" :key="node.id">
      <NodeImage v-if="node.type == screenNodeTypes.image" :data="node"></NodeImage>
    </Node>
  </div>
</template>

<script setup lang="ts">
import { screenRef, studioData } from '@/state'
import { useDragDrop } from '@/composables/DragDrop'
import Node from '@/components/studio/Node.vue'
import NodeImage from './nodes/Image.vue'
import { screenNodeTypes } from '@/enums'

const dragdrop = useDragDrop()
</script>
