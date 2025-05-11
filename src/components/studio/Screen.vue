<template>
  <div
    ref="screenRef"
    @dragenter.prevent="dragdrop.dragenter"
    @dragover.prevent="dragdrop.dragover"
    @dragleave="dragdrop.dragleave"
    @drop.prevent="dragdrop.drop"
    @click.stop="selection.clear()"
    class="relative w-full bg-black border border-[var(--border-color)] dark:border-[--border-dark-color] aspect-video shadow-[0_0_10px_var(--border-color)] dark:shadow-[0_0_10px_var(--border-dark-color)]"
  >
    <Node v-for="node of studioData.scene[activeScene]" :data="node" :key="node.id">
      <NodeImage v-if="node.type == screenNodeTypes.image" :data="node"></NodeImage>
      <NodeVideo v-if="node.type == screenNodeTypes.video" :data="node"></NodeVideo>
      <NodeSourceMedia v-if="node.type == screenNodeTypes.sourceMedia" :data="node"></NodeSourceMedia>
      <NodeLiveCamera v-if="node.type == screenNodeTypes.liveCamera" :data="node"></NodeLiveCamera>
      <NodeBackground v-if="node.type == screenNodeTypes.background" :data="node"></NodeBackground>
    </Node>
  </div>
</template>

<script setup lang="ts">
import { activeScene, screenRef, studioData } from '@/state'
import { useDragDrop } from '@/composables/DragDrop'
import { useSelection } from '@/composables/Selection'
import { screenNodeTypes } from '@/enums'
import Node from '@/components/studio/Node.vue'
import NodeImage from '@/components/studio/nodes/Image.vue'
import NodeVideo from '@/components/studio/nodes/Video.vue'
import NodeSourceMedia from '@/components/studio/nodes/SourceMedia.vue'
import NodeLiveCamera from '@/components/studio/nodes/LiveCamera.vue'
import NodeBackground from '@/components/studio/nodes/Background.vue'

const dragdrop = useDragDrop()
const selection = useSelection()
</script>
