<template>
  <div class="absolute w-full flex justify-end items-center top-1 right-1 gap-2">
    <ElPopover v-if="nodeType" placement="top">
      <template #reference>
        <ElIcon :size="20"><Headset /></ElIcon>
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
      @click.stop.left="removeNode()"
      class="!h-auto !p-1 !ml-0 !text-xs"
      type="danger"
    ></ElButton>
    <div class="absolute top-0 right-[-25px]">
      <VolumeBar v-if="nodeType" :value="nodeAudio.getVolume()" :min="0" :max="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { ElButton, ElIcon, ElPopover, ElSlider } from 'element-plus'
import { Delete, Headset } from '@element-plus/icons-vue'
import { isMediaNode } from '@/composables/utils'
import { studioData } from '@/state'
import { NodeId, volumeOptions } from '@/enums'
import VolumeBar from './node-tool/VolumeBar.vue'

const node = inject(NodeId)

const nodeAudio = node.getNodeAudio()
const nodeType = ref(isMediaNode(node.getNodeOptions().type))
const volume = ref(nodeType.value ? nodeAudio.getGainNode().gain.value : 0)

const volumePercentage = computed(() => (nodeType.value ? ((100 * volume.value) / volumeOptions.max).toFixed(0) : '0'))

function removeNode() {
  const index = studioData.value.nodes.findIndex((item) => item.id == node.getNodeOptions().id)
  studioData.value.nodes.splice(index, 1)
}

function changedVolume(value: number) {
  volume.value = value
  nodeAudio.getGainNode().gain.value = value
}
</script>
