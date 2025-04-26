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
      <NodeVideo v-if="node.type == screenNodeTypes.video" :data="node"></NodeVideo>
      <NodeSourceMedia v-if="node.type == screenNodeTypes.sourceMedia" :data="node"></NodeSourceMedia>
      <NodeBackground v-if="node.type == screenNodeTypes.background" :data="node"></NodeBackground>
    </Node>
  </div>
</template>

<script setup lang="ts">
import { screenRef, studioData } from '@/state'
import { useDragDrop } from '@/composables/DragDrop'
import { screenNodeTypes } from '@/enums'
import Node from '@/components/studio/Node.vue'
import NodeImage from '@/components/studio/nodes/Image.vue'
import NodeVideo from '@/components/studio/nodes/Video.vue'
import NodeSourceMedia from '@/components/studio/nodes/SourceMedia.vue'
import NodeBackground from '@/components/studio/nodes/Background.vue'

const dragdrop = useDragDrop()
</script>
