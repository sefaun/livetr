<template>
  <div
    ref="nodeRef"
    class="absolute w-full h-full select-none"
    :class="[
      selectedZIndex,
      selectedStatus && nonResizeNode ? 'border-2 border-[var(--primary-color)] resize-both resizable' : '',
    ]"
    :style="{ left: `${nodeOptions.position.x}px`, top: `${nodeOptions.position.y}px`, ...nodeOptions.style as any }"
    @mousedown.stop.left="mouseDown"
    @mouseup.stop.left="mouseUp"
    @click="click"
    @contextmenu.prevent.stop="node.contextMenu"
    @dragstart.prevent.stop
    @dragenter.prevent.stop
    @dragover.prevent.stop
    @dragleave.prevent.stop
  >
    <Resize
      v-if="nodeRef && selectedStatus && nonResizeNode"
      :nodeOptions="nodeOptions"
      :nodeRef="node.getNodeElement()"
    ></Resize>
    <slot />
    <NodeTool v-if="selectedStatus" :nodeId="nodeOptions.id" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, onBeforeUnmount, onMounted, computed } from 'vue'
import { nodes } from '@/state'
import { useNode } from '@/composables/Node'
import { useSelection } from '@/composables/Selection'
import { screenNodeTypes } from '@/enums'
import type { TNode } from '@/types'
import Resize from '@/components/studio/Resize.vue'
import NodeTool from '@/components/studio/NodeTool.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const nodeRef = ref<HTMLElement>()

const selection = useSelection()
const node = useNode({
  options: props.data,
})
const nodeOptions = node.getNodeOptions()

const nonResizeNode = computed(() => nodeOptions.type != screenNodeTypes.background)
const selectedStatus = computed(() => {
  if (selection.get().find((item) => item == nodeOptions.id)) {
    return true
  }

  return false
})

const selectedZIndex = computed(() => {
  if (nodeOptions.type == screenNodeTypes.background) {
    return 'z-999'
  }

  if (selection.get().find((item) => item == nodeOptions.id)) {
    return 'z-1001'
  }

  return 'z-1000'
})

function click(event: MouseEvent) {
  event.stopPropagation()
  node.click(event)
}

function mouseDown(event: MouseEvent) {
  if (nodeOptions.type == screenNodeTypes.background) {
    return
  }

  node.mouseDown(event)
}

function mouseUp(event: MouseEvent) {
  if (nodeOptions.type == screenNodeTypes.background) {
    return
  }

  node.mouseUp(event)
}

onMounted(() => {
  node.setNodeElement(nodeRef.value)
  selection.clear()
  selection.add(nodeOptions.id)
  nodes.value[nodeOptions.id] = node
})

onBeforeUnmount(() => {
  delete nodes.value[nodeOptions.id]
})
</script>
