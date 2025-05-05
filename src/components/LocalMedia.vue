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

const node = inject(NodeId)

const mediaRef = ref<HTMLVideoElement>()
const poster = ref('')

function loaded(value: boolean) {
  if (!value) {
    poster.value = VideoNotFound
  }
}

function ended() {
  console.log(9)
  node.getNodeAudio().destroy()
}

function firstPlay() {
  console.log(mediaRef.value.currentTime, 999)
  if (mediaRef.value.currentTime < 0.1) {
    node.getNodeAudio().start()
    node.getNodeAudio().createAudioStream((mediaRef.value as any).captureStream())
  }
}

onMounted(() => {
  mediaRef.value.addEventListener('play', firstPlay)
  mediaRef.value.addEventListener('ended', ended)
})

onBeforeUnmount(() => {
  mediaRef.value.removeEventListener('play', firstPlay)
  mediaRef.value.removeEventListener('ended', ended)
})
</script>
