<template>
  <div>
    <ElButton :icon="Plus" @click.left="selectVideo()">Ekle</ElButton>
    <div
      v-for="node of nodes"
      :id="node.id"
      @dragstart="dragdrop.dragstart($event, node)"
      draggable="true"
      class="w-full flex p-2 border border-gray-300 rounded-md cursor-move gap-2"
    >
      <div class="w-12 h-12">
        <MediaRender :type="mediaTypes.video" :src="node.data.src" class="w-full h-full rounded-md" />
      </div>
      <div class="flex items-center">{{ node.data.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { defaultNodes } from '@/state'
import { mediaTypes, screenNodeTypes } from '@/enums'
import MediaRender from '@/components/MediaRender.vue'
const { ipcRenderer } = window.require('electron') as typeof import('electron')
const fs = window.require('node:fs') as typeof import('node:fs')

const dragdrop = useDragDrop()
const nodes = ref(defaultNodes.filter((item) => item.type == screenNodeTypes.video))

async function selectVideo() {
  const filePaths = await ipcRenderer.invoke('select-video')

  for (const item of filePaths) {
    const directorySplit = item.split('\\')

    const fileName = directorySplit[directorySplit.length - 1]

    const fileData = fs.readFileSync(item, 'base64')

    nodes.value.push({
      id: window.crypto.randomUUID(),
      type: screenNodeTypes.video,
      position: {
        x: 0,
        y: 0,
      },
      style: {
        width: '150px',
        height: '150px',
      },
      data: {
        title: fileName,
        src: `data:video/mp4;base64,${fileData}`,
      },
    })
  }
}
</script>
