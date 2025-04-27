<template>
  <div
    ref="nodeRef"
    class="absolute w-full h-full z-1000 select-none border-2 border-[#00ff44] resize-both"
    :style="{ left: `${nodeOptions.position.x}px`, top: `${nodeOptions.position.y}px`, ...nodeOptions.style as any }"
    @mousedown.stop.left="mouseDown"
    @mouseup.stop.left="mouseUp"
    @contextmenu.prevent.stop="node.contextMenu"
    @dragstart.prevent.stop
    @dragenter.prevent.stop
    @dragover.prevent.stop
    @dragleave.prevent.stop
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { nodes } from '@/state'
import { useNode } from '@/composables/Node'
import { screenNodeTypes } from '@/enums'
import type { TNode } from '@/types'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const nodeRef = ref<HTMLElement>()

const node = useNode({
  options: props.data,
})
const nodeOptions = node.getNodeOptions()

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
  if (nodeOptions.type != screenNodeTypes.background) {
    node.start()
  }
  nodes.value[props.data.id] = node
})

onBeforeUnmount(() => {
  if (nodeOptions.type != screenNodeTypes.background) {
    node.destroy()
  }
  delete nodes.value[props.data.id]
})
</script>
