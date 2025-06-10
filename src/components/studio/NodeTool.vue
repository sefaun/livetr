<template>
  <div class="absolute w-full flex justify-end items-center top-1 right-1 gap-2">
    <ElPopover v-if="isMediaNodeType" placement="top">
      <template #reference>
        <ElButton
          :icon="Headset"
          @mousedown.stop
          @click.stop
          class="!h-auto !p-1 !ml-0 !text-xs"
          type="info"
        ></ElButton>
      </template>
      <div class="w-full">
        <ElSlider
          :model-value="volume"
          :min="volumeOptions.min"
          :max="volumeOptions.max"
          :step="0.01"
          :show-tooltip="false"
          @input="changedVolume($event as number)"
        />
        <div class="flex justify-center">% {{ volumePercentage }}</div>
      </div>
    </ElPopover>
    <ElButton
      :icon="Delete"
      @mousedown.stop
      @click.stop.left="removeNode(node.getNodeOptions().id)"
      class="!h-auto !p-1 !ml-0 !text-xs"
      type="danger"
    ></ElButton>
    <div class="absolute top-0 right-[-25px]">
      <VolumeBar v-if="isMediaNodeType" :value="nodeAudio.getVolume()" :min="0" :max="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElButton, ElPopover, ElSlider } from 'element-plus'
import { Delete, Headset } from '@element-plus/icons-vue'
import { isMediaNode, removeNode } from '@/composables/utils'
import { NodeId, volumeOptions } from '@/enums'
import VolumeBar from '@/components/studio/node-tool/VolumeBar.vue'

const node = inject(NodeId)

const nodeAudio = node.getNodeAudio()
const isMediaNodeType = ref(isMediaNode(node.getNodeOptions().type))
const volume = ref(0)

const volumePercentage = computed(() =>
  isMediaNodeType.value ? ((100 * volume.value) / volumeOptions.max).toFixed(0) : '0'
)

function changedVolume(value: number) {
  volume.value = value
  nodeAudio.getGainNode().gain.value = value
}

function startVolumeAnalyser() {
  const interval = setInterval(() => {
    if (isMediaNodeType && nodeAudio.getGainNode()) {
      nodeAudio.startAudioAnalyser()
      volume.value = nodeAudio.getGainNode().gain.value || 0
      clearInterval(interval)
    }
  }, 500)
}

onMounted(() => {
  startVolumeAnalyser()
})

onBeforeUnmount(() => {
  if (isMediaNodeType && nodeAudio.getGainNode()) {
    nodeAudio.destroyAudioAnalyser()
  }
})
</script>
