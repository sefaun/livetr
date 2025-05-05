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
import { onBeforeUnmount, onMounted, ref, inject, useAttrs } from 'vue'
import { useLiveMedia } from '@/composables/LiveMedia'
import { NodeId } from '@/enums'
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

const node = inject(NodeId)

const attrs = useAttrs()
const liveMedia = useLiveMedia()

let stream: MediaStream
const mediaRef = ref<HTMLVideoElement>()
const poster = ref('')
const srcStatus = ref(attrs.src ? true : false)
const srcVideoEnded = ref(false)

function loaded(value: boolean) {
  if (!value) {
    poster.value = VideoNotFound
  }
}

async function getUserMedia() {
  stream = await liveMedia.getUserMedia(props)
  mediaRef.value.srcObject = stream
}

function setSrcVideoEnded(value: boolean) {
  srcVideoEnded.value = value
}

function captureStream() {
  node.getNodeAudio().createAudioStream((mediaRef.value as any).captureStream(), false)
}

function ended() {
  setSrcVideoEnded(false)
}

function firstPlay() {
  if (mediaRef.value.currentTime < 0.1 || !srcVideoEnded.value) {
    captureStream()
    setSrcVideoEnded(true)
  }
}

onMounted(async () => {
  if (!srcStatus.value) {
    await getUserMedia()
  }

  if (node) {
    if (srcStatus.value) {
      mediaRef.value.addEventListener('play', firstPlay)
      mediaRef.value.addEventListener('ended', ended)
    } else {
      node.getNodeAudio().createAudioStream(stream)
    }
  }
})

onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    mediaRef.value.srcObject = null
  }

  if (node) {
    if (srcStatus.value) {
      mediaRef.value.removeEventListener('play', firstPlay)
      mediaRef.value.removeEventListener('ended', ended)
    }
  }
})
</script>
