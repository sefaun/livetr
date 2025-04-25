<template>
  <div>
    <div
      v-for="node of nodes"
      :id="node.id"
      @dragstart="dragdrop.dragstart($event, node)"
      draggable="true"
      class="w-full flex p-2 border border-gray-300 rounded-md cursor-move gap-2"
    >
      <div class="w-12 h-12">
        <MediaRender :type="mediaTypes.img" :src="node.data.src" mediaClass="object-cover rounded-md" />
      </div>
      <div class="flex items-center">{{ node.data.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDragDrop } from '@/composables/DragDrop'
import { defaultNodes } from '@/state'
import { mediaTypes, screenNodeTypes } from '@/enums'
import MediaRender from '@/components/MediaRender.vue'

const dragdrop = useDragDrop()
const nodes = defaultNodes.filter((item) => item.type == screenNodeTypes.background)
</script>
