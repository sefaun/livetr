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
    <template v-if="studioData.scene[activeScene]">
      <Node v-for="(node, index) of studioData.scene[activeScene].nodes" :key="node.id" :index="index" :data="node">
        <component :is="component(node.type)" :data="node" />
      </Node>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useSelection } from '@/composables/Selection'
import { activeScene, screenRef, studioData } from '@/state'
import { screenNodeTypes } from '@/enums'
import type { TScreenNodeTypes } from '@/types'
import Node from '@/components/studio/Node.vue'
import NodeText from '@/components/studio/nodes/Text.vue'
import NodeImage from '@/components/studio/nodes/Image.vue'
import NodeVideo from '@/components/studio/nodes/Video.vue'
import NodeSourceMedia from '@/components/studio/nodes/SourceMedia.vue'
import NodeLiveCamera from '@/components/studio/nodes/LiveCamera.vue'
import NodeBackground from '@/components/studio/nodes/Background.vue'

const dragdrop = useDragDrop()
const selection = useSelection()

const component = computed(() => {
  return (type: TScreenNodeTypes) => {
    switch (type) {
      case screenNodeTypes.text:
        return NodeText

      case screenNodeTypes.image:
        return NodeImage

      case screenNodeTypes.video:
        return NodeVideo

      case screenNodeTypes.sourceMedia:
        return NodeSourceMedia

      case screenNodeTypes.liveCamera:
        return NodeLiveCamera

      case screenNodeTypes.background:
        return NodeBackground
    }
  }
})
</script>
