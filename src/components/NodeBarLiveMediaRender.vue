<template>
  <video
    ref="mediaRef"
    v-bind="attrs"
    :poster="poster"
    @load="loaded(true)"
    @error="loaded(false)"
    class="w-full h-full"
  ></video>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { useLiveMedia } from '@/composables/LiveMedia'
import VideoNotFound from '@/assets/video-not-found.jpeg'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  liveId: {
    type: String,
    default: '',
    required: false,
  },
})

const attrs = useAttrs()
const liveMedia = useLiveMedia()

let stream: MediaStream
const mediaRef = ref<HTMLVideoElement>()
const poster = ref('')

function loaded(value: boolean) {
  if (!value) {
    poster.value = VideoNotFound
  }
}

async function getUserMedia() {
  stream = await liveMedia.getUserMedia(props)
  mediaRef.value.srcObject = stream
}

onMounted(() => {
  getUserMedia()
})

onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    mediaRef.value.srcObject = null
  }
})
</script>
