<template>
  <!-- Sahne küçültülse de araç butonları okunabilir boyutta kalır. -->
  <div class="node-tool absolute w-full flex justify-end items-center top-1 right-1 gap-2">
    <ElPopover v-if="isMediaNodeType" :disabled="!nodeAudio.hasAudio()" placement="top">
      <template #reference>
        <ElButton
          :icon="Headset"
          :disabled="!nodeAudio.hasAudio()"
          @mousedown.stop
          @click.stop
          class="!h-auto !p-1 !ml-0 !text-xs"
          type="info"
        ></ElButton>
      </template>
      <div class="w-full">
        <ElSlider
          :model-value="nodeAudio.getGain()"
          :min="volumeOptions.min"
          :max="volumeOptions.max"
          :step="0.01"
          :show-tooltip="false"
          @input="nodeAudio.setGain($event as number)"
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
      <VolumeBar v-if="isMediaNodeType && nodeAudio.hasAudio()" :value="nodeAudio.getVolume()" :min="0" :max="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue'
import { ElButton, ElPopover, ElSlider } from 'element-plus'
import { Delete, Headset } from '@element-plus/icons-vue'
import { isMediaNode, removeNode } from '@/composables/utils'
import { NodeId, volumeOptions } from '@/enums'
import VolumeBar from '@/components/studio/node-tool/VolumeBar.vue'

const node = inject(NodeId)

const nodeAudio = node.getNodeAudio()
const isMediaNodeType = isMediaNode(node.getNodeOptions().type)

const volumePercentage = computed(() => ((100 * nodeAudio.getGain()) / volumeOptions.max).toFixed(0))

// Ses seviyesi göstergesi sadece node seçiliyken ve kaynağın sesi varken çalışır.
watch(
  () => nodeAudio.hasAudio(),
  (hasAudio) => {
    if (isMediaNodeType && hasAudio) {
      nodeAudio.startAudioAnalyser()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  nodeAudio.destroyAudioAnalyser()
})
</script>
