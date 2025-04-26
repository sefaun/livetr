<template>
  <div class="w-full h-full">
    <video
      ref="mediaRef"
      v-show="loadStatus"
      v-bind="$attrs"
      @load="loaded(true)"
      @error="loaded(false)"
      autoplay
      class="w-full h-full"
    />
    <div
      v-show="!loadStatus"
      class="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md"
    >
      <ElIcon :size="props.iconSize" :color="props.iconColor">
        <VideoPlay />
      </ElIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElIcon } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  sourceId: {
    type: String,
    default: '',
    required: false,
  },
  liveId: {
    type: String,
    default: '',
    required: false,
  },
  iconSize: {
    type: Number,
    default: 24,
  },
  iconColor: {
    type: String,
    default: '',
  },
})

let stream: MediaStream
const mediaRef = ref()
const loadStatus = ref(true)

function loaded(value: boolean) {
  loadStatus.value = value
}

async function liveMedia() {
  loaded(true)

  stream = await navigator.mediaDevices.getUserMedia({
    audio: props.liveId ? true : false,
    video: props.liveId
      ? { deviceId: { exact: props.liveId } }
      : ({
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: props.sourceId,
          },
        } as any),
  })

  mediaRef.value.srcObject = stream
  mediaRef.value.play()
}

onMounted(() => {
  liveMedia()
})

onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    mediaRef.value.srcObject = null
  }
})
</script>
