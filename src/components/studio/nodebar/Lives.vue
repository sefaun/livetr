<template>
  <div>
    <ElButton :icon="Refresh" @click.left="refreshLiveMedias()" type="success"></ElButton>
  </div>
  <ElSkeleton class="w-64 h-full" :loading="loading.get()" animated>
    <template #template>
      <div class="flex h-full gap-2">
        <ElSkeletonItem variant="image" class="!w-28 !h-full !rounded-md" />
        <ElSkeletonItem variant="image" class="!w-28 !h-full !rounded-md" />
        <ElSkeletonItem variant="image" class="!w-28 !h-full !rounded-md" />
      </div>
    </template>
  </ElSkeleton>
  <div v-if="!loading.get()" class="flex items-center gap-2">
    <div
      v-for="source of filteredLive"
      @dragstart="
        createLiveMedia($event, {
          id: source.deviceId,
          name: source.label,
          type: screenNodeTypes.liveCamera,
        })
      "
      draggable="true"
      class="h-fit border border-[var(--border-color)] dark:border-[--border-dark-color] rounded-md cursor-pointer p-1"
    >
      <ElTooltip :content="source.label" :hide-after="0" effect="dark" placement="top">
        <div class="w-28">
          <div>
            <LiveMedia :liveId="source.deviceId" autoplay muted class="!w-28 !h-20 !rounded-md" />
          </div>
          <div class="text-xs truncate px-2 text-center mt-1">{{ source.label }}</div>
        </div>
      </ElTooltip>
    </div>
    <div
      v-for="source of filteredSource"
      @dragstart="
        createLiveMedia($event, {
          id: source.id,
          name: source.name,
          type: screenNodeTypes.sourceMedia,
        })
      "
      draggable="true"
      class="h-fit border border-[var(--border-color)] dark:border-[--border-dark-color] rounded-md cursor-pointer p-1"
    >
      <ElTooltip :content="source.name" :hide-after="0" effect="dark" placement="top">
        <div class="w-28">
          <div>
            <img :src="source.thumbnail" class="w-28 h-20 rounded-md" />
          </div>
          <div class="text-xs truncate px-2 text-center mt-1">{{ source.name }}</div>
        </div>
      </ElTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { ElTooltip, ElButton, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useLiveMedia } from '@/composables/LiveMedia'
import { useState } from '@/composables/State'
import { screenNodeTypes } from '@/enums'
import { studioData } from '@/state'
import type { TSourceMediaNodeData, TScreenNodeTypes, TLiveCameraNodeData } from '@/types'
import LiveMedia from '@/components/LiveMedia.vue'

const dragdrop = useDragDrop()
const liveMedia = useLiveMedia()
const loading = useState(true)

const filteredLive = computed(() => {
  return liveMedia
    .getLiveCameras()
    .filter(
      (item) =>
        !studioData.value.nodes.some(
          (node) => node.type == screenNodeTypes.liveCamera && (node.data as TLiveCameraNodeData).id == item.deviceId
        )
    )
})

const filteredSource = computed(() => {
  return liveMedia
    .getLiveMedias()
    .filter(
      (item) =>
        !studioData.value.nodes.some(
          (node) => node.type == screenNodeTypes.sourceMedia && (node.data as TSourceMediaNodeData).id == item.id
        )
    )
})

async function createLiveMedia(
  event: DragEvent,
  source: {
    id: string
    name: string
    type: TScreenNodeTypes
  }
) {
  dragdrop.dragstart(event, {
    type: source.type,
    style: {
      width: '300px',
      height: '300px',
    },
    data: {
      id: source.id,
      title: source.name,
    },
  } as any)
}

async function refreshLiveMedias() {
  loading.set(true)
  await liveMedia.listCameras()
  await liveMedia.listLiveMedia()
  loading.set(false)
}

onMounted(() => {
  setTimeout(() => {
    refreshLiveMedias()
  }, 2000)
})
</script>
