<template>
  <video ref="mediaRef" v-bind="attrs" :poster="poster" playsinline class="w-full h-full"></video>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { useLiveMedia } from '@/composables/LiveMedia'
import VideoNotFound from '@/assets/video-not-found.jpeg'

defineOptions({
  inheritAttrs: false,
})

/** Kamera listesindeki küçük önizleme. Sadece görüntü açılır (mikrofon açılmaz). */
const props = defineProps({
  liveId: {
    type: String,
    default: '',
    required: false,
  },
})

const attrs = useAttrs()
const liveMedia = useLiveMedia()

let stream: MediaStream = null
let unmounted = false
const mediaRef = ref<HTMLVideoElement>()
const poster = ref<string>()

async function getUserMedia() {
  try {
    stream = await liveMedia.getUserMedia({ liveId: props.liveId }, { audio: false, preview: true })
  } catch (error) {
    console.warn('[media] camera preview could not be opened', error)
    poster.value = VideoNotFound
    return
  }

  if (unmounted) {
    stream.getTracks().forEach((track) => track.stop())
    return
  }

  mediaRef.value.srcObject = stream
}

onMounted(() => {
  getUserMedia()
})

onBeforeUnmount(() => {
  unmounted = true
  stream?.getTracks().forEach((track) => track.stop())
  if (mediaRef.value) {
    mediaRef.value.srcObject = null
  }
})
</script>
