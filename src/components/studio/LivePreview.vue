<template>
  <video ref="videoRef" class="w-full h-full rounded-md" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const videoRef = ref<HTMLVideoElement>()
const stream = ref<MediaStream>()

onMounted(async () => {
  stream.value = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { deviceId: { exact: props.id } },
  })

  videoRef.value.srcObject = stream.value
  videoRef.value.play()
})

onBeforeUnmount(() => {
  stream.value?.getTracks()?.forEach(function (track) {
    track.stop()
  })
})
</script>
