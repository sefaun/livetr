<template>
  <div
    ref="nodeRef"
    class="absolute w-[100px] h-[100px] z-[1000] select-none"
    :style="{ left: `${nodeOptions.position.x}px`, top: `${nodeOptions.position.y}px`, ...nodeOptions.style as any }"
    @mousedown.stop.left="node.mouseDown"
    @mouseup.stop.left="node.mouseUp"
    @contextmenu.prevent.stop="node.contextMenu"
    @dragstart.prevent.stop
    @dragenter.prevent.stop
    @dragover.prevent.stop
    @dragleave.prevent.stop
    @drop.prevent.stop
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { nodes } from '@/state'
import { useNode } from '@/composables/Node'
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

onMounted(() => {
  node.setNodeElement(nodeRef.value)
  node.start()
  nodes.value[props.data.id] = node
})

onBeforeUnmount(() => {
  node.destroy()
  delete nodes.value[props.data.id]
})
</script>
