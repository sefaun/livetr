<template>
  <div>
    <ElButton :icon="Refresh" @click.left="refreshLiveMedias()" type="success"></ElButton>
  </div>
  <ElSkeleton class="w-64 h-full" :loading="loading" animated>
    <template #template>
      <div class="flex h-full gap-2">
        <ElSkeletonItem variant="image" class="!w-28 !h-full !rounded-md" />
        <ElSkeletonItem variant="image" class="!w-28 !h-full !rounded-md" />
        <ElSkeletonItem variant="image" class="!w-28 !h-full !rounded-md" />
      </div>
    </template>
  </ElSkeleton>
  <div v-if="!loading" class="flex items-center gap-2">
    <div
      v-for="source of filteredLive"
      :key="source.deviceId"
      @dragstart="
        createLiveMedia($event, {
          id: source.deviceId,
          name: source.label,
          type: screenNodeTypes.liveCamera,
        })
      "
      draggable="true"
      class="h-fit border border-[var(--border-color)] dark:border-(--border-dark-color) rounded-md cursor-pointer p-1"
    >
      <ElTooltip :content="source.label" :hide-after="0" effect="dark" placement="top">
        <div class="w-28">
          <div>
            <NodeBarLiveMediaRender :liveId="source.deviceId" autoplay muted class="!w-28 !h-20 !rounded-md" />
          </div>
          <div class="text-xs truncate px-2 text-center mt-1">{{ source.label }}</div>
        </div>
      </ElTooltip>
    </div>
    <div
      v-for="source of filteredSource"
      :key="source.id"
      @dragstart="
        createLiveMedia($event, {
          id: source.id,
          name: source.name,
          aspectRatio: source.aspectRatio,
          type: screenNodeTypes.sourceMedia,
        })
      "
      draggable="true"
      class="h-fit border border-[var(--border-color)] dark:border-(--border-dark-color) rounded-md cursor-pointer p-1"
    >
      <ElTooltip :content="source.name" :hide-after="0" effect="dark" placement="top">
        <div class="w-28">
          <div>
            <MediaRender :src="source.thumbnail" class="w-28 h-20 rounded-md object-contain bg-black" />
          </div>
          <div class="text-xs truncate px-2 text-center mt-1">{{ source.name }}</div>
        </div>
      </ElTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'
import { ElTooltip, ElButton, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useLiveMedia } from '@/composables/LiveMedia'
import { activeScene, studioData } from '@/state'
import { screenNodeTypes, stageSize } from '@/enums'
import type { TSourceMediaNodeData, TScreenNodeTypes, TLiveCameraNodeData, TNode } from '@/types'
import NodeBarLiveMediaRender from '@/components/NodeBarLiveMediaRender.vue'
import MediaRender from '@/components/MediaRender.vue'

const dragdrop = useDragDrop()
const liveMedia = useLiveMedia()
const loading = ref(true)
let refreshTimer: ReturnType<typeof setTimeout> = null

function sceneNodes() {
  return studioData.value.scene[activeScene.value]?.nodes ?? []
}

const filteredLive = computed(() => {
  return liveMedia
    .getLiveCameras()
    .filter(
      (item) =>
        !sceneNodes().some(
          (node) => node.type == screenNodeTypes.liveCamera && (node.data as TLiveCameraNodeData).id == item.deviceId
        )
    )
})

const filteredSource = computed(() => {
  return liveMedia
    .getLiveMedias()
    .filter(
      (item) =>
        !sceneNodes().some(
          (node) => node.type == screenNodeTypes.sourceMedia && (node.data as TSourceMediaNodeData).id == item.id
        )
    )
})

function createLiveMedia(
  event: DragEvent,
  source: {
    id: string
    name: string
    aspectRatio?: number
    type: TScreenNodeTypes
  }
) {
  /**
   * Kaynağın en-boy oranı korunur. Oran bilinmiyorsa (kamera) 4:3 kabul edilir.
   */
  const aspectRatio = typeof source.aspectRatio == 'number' && source.aspectRatio > 0 ? source.aspectRatio : 4 / 3
  const height = Math.min(300, stageSize.height, stageSize.width / aspectRatio)
  const width = height * aspectRatio

  dragdrop.dragstart(event, {
    type: source.type,
    style: {
      width: `${Math.round(width)}px`,
      height: `${Math.round(height)}px`,
    },
    data: {
      id: source.id,
      title: source.name,
    },
  } as TNode)
}

async function refreshLiveMedias() {
  loading.value = true
  await Promise.all([liveMedia.listCameras(), liveMedia.listLiveMedia()])
  loading.value = false
}

function onDeviceChange() {
  liveMedia.listCameras()
}

onMounted(() => {
  refreshTimer = setTimeout(() => refreshLiveMedias(), 500)
  navigator.mediaDevices?.addEventListener('devicechange', onDeviceChange)
})

onBeforeUnmount(() => {
  clearTimeout(refreshTimer)
  navigator.mediaDevices?.removeEventListener('devicechange', onDeviceChange)
})
</script>
