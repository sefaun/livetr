<template>
  <div>
    <input type="file" accept="image/*" @change="selectImage" />
    <div
      v-for="node of nodes"
      :id="node.id"
      @dragstart="dragdrop.dragstart($event, node)"
      draggable="true"
      class="w-full flex p-2 border border-gray-300 rounded-md cursor-move gap-2"
    >
      <div class="w-12 h-12">
        <MediaRender :type="mediaTypes.img" :src="node.data.src" class="w-full h-full rounded-md" />
      </div>
      <div class="flex items-center">{{ node.data.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDragDrop } from '@/composables/DragDrop'
import { defaultNodes } from '@/state'
import { mediaTypes, screenNodeTypes } from '@/enums'
import MediaRender from '@/components/MediaRender.vue'

const dragdrop = useDragDrop()
const nodes = ref(defaultNodes.filter((item) => item.type == screenNodeTypes.image))

async function selectImage(event: Event) {
  const target = event.target as HTMLInputElement

  for (const item of target.files) {
    nodes.value.push({
      id: window.crypto.randomUUID(),
      type: screenNodeTypes.image,
      position: {
        x: 0,
        y: 0,
      },
      style: {
        width: '150px',
        height: '150px',
      },
      data: {
        title: item.name,
        src: URL.createObjectURL(item),
      },
    })
  }
}
</script>
