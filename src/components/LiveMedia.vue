<template>
  <video
    ref="mediaRef"
    v-bind="$attrs"
    :poster="poster"
    @load="loaded(true)"
    @error="loaded(false)"
    autoplay
    class="w-full h-full"
  ></video>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import VideoNotFound from '@/assets/video-not-found.jpeg'

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
})

let stream: MediaStream
const mediaRef = ref()
const poster = ref('')

function loaded(value: boolean) {
  if (!value) {
    poster.value = VideoNotFound
  }
}

async function liveMedia() {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: props.liveId
      ? true
      : ({
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: props.sourceId,
          },
        } as any),
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
