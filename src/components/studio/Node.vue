<template>
  <div
    ref="nodeRef"
    class="absolute w-full h-full select-none"
    :class="[selectedStatus && nonResizeNode ? 'border-2 border-[var(--primary-color)] resize-both resizable' : '']"
    :style="{ left: `${node.getNodeOptions().position.x}px`, top: `${node.getNodeOptions().position.y}px`, ...node.getNodeOptions().style as any }"
    @mousedown.stop.left="mouseDown"
    @mouseup.stop.left="mouseUp"
    @click="click"
    @contextmenu.prevent.stop="node.contextMenu"
    @dragstart.prevent.stop
    @dragenter.prevent.stop
    @dragover.prevent.stop
    @dragleave.prevent.stop
  >
    <Resize v-if="nodeRef && selectedStatus && nonResizeNode" />
    <slot />
    <NodeTool v-if="selectedStatus" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, onBeforeUnmount, onMounted, computed, provide, watch } from 'vue'
import { useNode } from '@/composables/Node'
import { useSelection } from '@/composables/Selection'
import { activeScene, nodes, studioData } from '@/state'
import { NodeId, screenNodeTypes } from '@/enums'
import type { TNode } from '@/types'
import Resize from '@/components/studio/Resize.vue'
import NodeTool from '@/components/studio/NodeTool.vue'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const selection = useSelection()
const node = useNode({
  options: props.data,
})
provide(NodeId, node)

const nodeRef = ref<HTMLElement>()
const nodeOptions = node.getNodeOptions()

watch(node.getNodeOptions(), (val) => {
  studioData.value.scene[activeScene.value].nodes[props.index] = val
})

const nonResizeNode = computed(() => nodeOptions.type != screenNodeTypes.background)
const selectedStatus = computed(() => {
  if (selection.get().find((item) => item == nodeOptions.id)) {
    return true
  }

  return false
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
