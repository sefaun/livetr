<template>
  <video
    ref="mediaRef"
    v-bind="$attrs"
    :poster="poster"
    @load="loaded(true)"
    @error="loaded(false)"
    class="w-full h-full"
  ></video>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, inject } from 'vue'
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

let stream: MediaStream
const mediaRef = ref<HTMLVideoElement>()
const poster = ref('')
const srcStatus = ref(false)

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
}

onMounted(async () => {
  srcStatus.value = mediaRef.value.getAttribute('src') ? true : false

  if (!srcStatus.value) {
    await liveMedia()
  }

  if (node) {
    if (srcStatus.value) {
      mediaRef.value.onloadeddata = () => {
        node.getNodeAudio().createAudioStream((mediaRef.value as any).captureStream())
      }
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
})
</script>
