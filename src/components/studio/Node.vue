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
    <Resize v-if="nodeRef && selectedStatus && nonResizeNode" />
    <slot />
    <NodeTool v-if="selectedStatus" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, onBeforeUnmount, onMounted, computed, provide, watch } from 'vue'
import { cloneDeep } from 'lodash'
import { useNode } from '@/composables/Node'
import { useSelection } from '@/composables/Selection'
import { useScreenChange } from '@/composables/ScreenChange'
import { isMediaNode } from '@/composables/utils'
import { nodes, studioData, activeScene } from '@/state'
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
const screenChange = useScreenChange()
const node = useNode({
  options: props.data,
})
provide(NodeId, node)

const nodeRef = ref<HTMLElement>()
const nodeOptions = node.getNodeOptions()
const nodeAudio = node.getNodeAudio()
let nodeChanged = false
let backupOptions = cloneDeep(nodeOptions)

const nonResizeNode = computed(() => nodeOptions.type != screenNodeTypes.background)
const selectedStatus = computed(() => {
  if (selection.get().find((item) => item == nodeOptions.id)) {
    return true
  }

  return false
})

const saveChangeId = screenChange.onSaveChanges(() => {
  if (nodeChanged) {
    studioData.value.scene[activeScene.value].nodes[props.index] = cloneDeep(backupOptions)
  }

  nodeChanged = false
})

watch(nodeOptions, (val) => {
  screenChange.setScreenChangeStatus(true)
  nodeChanged = true
  backupOptions = val
})

if (isMediaNode(nodeOptions.type)) {
  watch(selectedStatus, (val) => {
    if (val) {
      nodeAudio.startAudioAnalyser()
    } else {
      nodeAudio.destroyAudioAnalyser()
    }
  })
}

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
  screenChange.removeChangeCallback(saveChangeId)
  delete nodes.value[nodeOptions.id]
})
</script>
