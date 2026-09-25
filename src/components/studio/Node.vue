<template>
  <div
    ref="nodeRef"
    class="absolute w-full h-full select-none"
    :class="[selectedStatus && resizable ? 'outline outline-2 outline-[var(--primary-color)]' : '']"
    :style="nodeStyle"
    @mousedown.stop.left="mouseDown"
    @click.stop="node.click"
    @contextmenu.prevent.stop
    @dragstart.prevent.stop
    @dragenter.prevent.stop
    @dragover.prevent.stop
    @dragleave.prevent.stop
  >
    <Resize v-if="nodeRef && selectedStatus && resizable" />
    <slot />
    <NodeTool v-if="selectedStatus" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, onBeforeUnmount, onMounted, computed, provide } from 'vue'
import { useNode } from '@/composables/Node'
import { useSelection } from '@/composables/Selection'
import { getZIndex } from '@/composables/NodeOrder'
import { nodeRegistry } from '@/state'
import { NodeId, screenNodeTypes } from '@/enums'
import type { TNode } from '@/types'
import Resize from '@/components/studio/Resize.vue'
import NodeTool from '@/components/studio/NodeTool.vue'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    required: true,
  },
})

const selection = useSelection()
// Node, sahne verisindeki nesnenin kendisi üzerinde çalışır; ayrı bir kopya ve senkronizasyon gerekmez.
const node = useNode({
  options: props.data,
})
provide(NodeId, node)

const nodeRef = ref<HTMLElement>()
const isBackground = computed(() => props.data.type == screenNodeTypes.background)
// Metin boyutu içeriğe göre belirlenir, arka plan tüm sahneyi kaplar; ikisi de elle boyutlandırılmaz.
const resizable = computed(() => !isBackground.value && props.data.type != screenNodeTypes.text)
const selectedStatus = computed(() => selection.get().includes(props.data.id))
const nodeStyle = computed(() => ({
  ...(props.data.style as Record<string, string>),
  left: `${props.data.position.x}px`,
  top: `${props.data.position.y}px`,
  // Arka plan her zaman diğer öğelerin altında kalır (yayın canvas'ındaki çizim sırasıyla aynı).
  zIndex: isBackground.value ? '0' : Math.max(1, getZIndex(props.data)).toString(),
}))

function mouseDown(event: MouseEvent) {
  if (isBackground.value) {
    return
  }

  node.mouseDown(event)
}

onMounted(() => {
  node.setNodeElement(nodeRef.value)
  nodeRegistry.set(props.data.id, node)
})

onBeforeUnmount(() => {
  if (nodeRegistry.get(props.data.id) == node) {
    nodeRegistry.delete(props.data.id)
  }

  node.destroy()
})
</script>
