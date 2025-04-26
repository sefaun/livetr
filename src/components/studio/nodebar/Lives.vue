<template>
  <div>
    <ElButton :icon="Refresh" @click.left="refreshLiveMedias()" type="success"></ElButton>
  </div>
  <ElSkeleton class="w-64 h-full" :loading="loading.get()" animated>
    <template #template>
      <div class="flex h-full gap-2">
        <ElSkeletonItem variant="image" class="!w-36 !h-full !rounded-md" />
        <ElSkeletonItem variant="image" class="!w-36 !h-full !rounded-md" />
        <ElSkeletonItem variant="image" class="!w-36 !h-full !rounded-md" />
      </div>
    </template>
  </ElSkeleton>
  <div v-if="!loading.get()" class="flex gap-2">
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
      class="border border-[var(--wire-color)] dark:border-[--wire-dark-color] rounded-md cursor-pointer"
    >
      <ElTooltip :content="source.label" :hide-after="0" effect="dark" placement="top">
        <div class="flex justify-center items-center">
          <div class="w-28 h-20">
            <div class="w-full h-full">
              <LivePreview :id="source.deviceId" class="w-full h-full rounded-md" />
            </div>
            <div class="text-xs truncate px-2 text-center">{{ source.label }}</div>
          </div>
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
      class="border border-[var(--wire-color)] dark:border-[--wire-dark-color] rounded-md cursor-pointer"
    >
      <ElTooltip :content="source.name" :hide-after="0" effect="dark" placement="top">
        <div class="flex justify-center items-center">
          <div class="w-28 h-20">
            <div class="w-full h-full">
              <img :src="source.thumbnail" class="w-full h-full rounded-md" />
            </div>
            <div class="text-xs truncate px-2 text-center">{{ source.name }}</div>
          </div>
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
import LivePreview from '@/components/studio/LivePreview.vue'

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

async function refreshLiveMedias() {
  loading.set(true)
  await liveMedia.listCameras()
  await liveMedia.listLiveMedia()
  loading.set(false)
}

onMounted(() => {
  refreshLiveMedias()
})
</script>
