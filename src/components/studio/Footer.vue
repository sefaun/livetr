<template>
  <div class="flex gap-2">
    <div
      v-for="source of sources"
      :key="source.id"
      @dragstart="createLiveMedia($event, source)"
      class="flex justify-center items-center border border-[var(--wire-color)] dark:border-[--wire-dark-color] rounded-md cursor-pointer"
    >
      <ElTooltip :content="source.name" :hide-after="0" effect="dark" placement="top">
        <div class="w-28 h-20">
          <div class="w-full h-full">
            <img :src="source.thumbnail" class="w-full h-full rounded-md" alt="" />
          </div>
          <div class="text-sm truncate">{{ source.name }}</div>
        </div>
      </ElTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElTooltip } from 'element-plus'
import { useDragDrop } from '@/composables/DragDrop'
import { screenNodeTypes } from '@/enums'
const { ipcRenderer } = window.require('electron') as typeof import('electron')

const dragdrop = useDragDrop()

type TLocalSource = {
  id: string
  name: string
  thumbnail: string
}
const sources = ref<TLocalSource[]>([])

async function createLiveMedia(event: DragEvent, source: TLocalSource) {
  dragdrop.dragstart(event, {
    type: screenNodeTypes.sourceMedia,
    style: {
      zIndex: '1000',
      width: '200px',
      height: '200px',
    },
    data: {
      id: source.id,
      title: source.name,
    },
  } as any)
}

async function getSources() {
  const mediaSources = (await ipcRenderer.invoke('getMediaSources')) as Electron.DesktopCapturerSource[]

  sources.value = mediaSources.map((item) => ({
    id: item.id,
    name: item.name,
    thumbnail: item.thumbnail.toDataURL(),
  }))
}

onMounted(() => {
  getSources()
})
</script>
