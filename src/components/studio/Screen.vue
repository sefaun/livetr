<template>
  <div ref="containerRef" class="w-full h-full flex justify-center items-start">
    <div
      :style="{ width: `${stageSize.width * scale}px`, height: `${stageSize.height * scale}px` }"
      class="relative shrink-0 bg-black outline outline-1 outline-[var(--border-color)] dark:outline-(--border-dark-color) shadow-[0_0_10px_var(--border-color)] dark:shadow-[0_0_10px_var(--border-dark-color)]"
    >
      <div
        :ref="setScreenRef"
        :style="{
          width: `${stageSize.width}px`,
          height: `${stageSize.height}px`,
          transform: `scale(${scale})`,
          '--stage-scale': scale,
        }"
        @dragenter.prevent="dragdrop.dragenter"
        @dragover.prevent="dragdrop.dragover"
        @dragleave="dragdrop.dragleave"
        @drop.prevent="dragdrop.drop"
        @click.stop="selection.clear()"
        class="absolute top-0 left-0 origin-top-left"
      >
        <template v-if="studioData.scene[activeScene]">
          <Node v-for="node of studioData.scene[activeScene].nodes" :key="node.id" :data="node">
            <component :is="component(node.type)" :data="node" />
          </Node>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useSelection } from '@/composables/Selection'
import { activeScene, screenRef, stageScale, studioData } from '@/state'
import { screenNodeTypes, stageSize } from '@/enums'
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

const containerRef = ref<HTMLElement>()
const scale = computed(() => stageScale.value)
let resizeObserver: ResizeObserver

function setScreenRef(element: Element | ComponentPublicInstance | null) {
  screenRef.value = element as HTMLElement
}

function updateScale() {
  const container = containerRef.value
  if (!container) {
    return
  }

  const value = Math.min(container.clientWidth / stageSize.width, container.clientHeight / stageSize.height)
  if (value > 0 && Number.isFinite(value)) {
    stageScale.value = value
  }
}

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

onMounted(() => {
  updateScale()
  resizeObserver = new ResizeObserver(() => updateScale())
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>
