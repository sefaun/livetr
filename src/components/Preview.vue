<template>
  <div
    :class="preview.getCanvasPreviewStatus() ? 'left-1' : 'left-[9999px]'"
    class="fixed bottom-1 z-10 border border-amber-300 pointer-events-none"
  >
    <div class="relative w-full h-full">
      <canvas ref="canvasPreviewRef" width="1280" height="720"></canvas>
      <div class="absolute top-1 right-1">
        <ElButton
          :icon="Close"
          @click.stop.left="preview.setCanvasPreviewStatus(false)"
          class="pointer-events-auto"
          type="danger"
          circle
        ></ElButton>
      </div>
    </div>
  </div>
  <transition
    name="slide-down"
    enter-active-class="transition-all duration-700 ease-in-out"
    leave-active-class="transition-all duration-700 ease-in-out"
    enter-from-class="-translate-y-full"
    enter-to-class="translate-y-0"
    leave-from-class="translate-y-0"
    leave-to-class="-translate-y-full"
  >
    <div
      v-show="preview.getVideoPreviewStatus()"
      class="fixed top-0 left-0 w-full h-full bg-black/75 bg-opacity-80 z-10"
    >
      <div class="relative w-full h-full flex justify-center">
        <video ref="videoPreviewRef" width="1280" height="720" controls></video>
        <div class="absolute top-1 right-1">
          <ElButton
            :icon="Close"
            @click.stop.left="preview.setVideoPreviewStatus(false)"
            type="danger"
            circle
          ></ElButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, ref } from 'vue'
import { ElButton } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { canvasPreviewRef, videoPreviewRef } from '@/state'
import { useCanvasRendering } from '@/composables/CanvasRendering'
import { useAudio } from '@/composables/Audio'
import { usePreview } from '@/composables/Preview'

const preview = usePreview()
const audio = useAudio()
const canvasRendering = useCanvasRendering()

const canvasStream = ref<MediaStream>()
const destination = ref<MediaStreamAudioDestinationNode>()

function playVideoPreview() {
  canvasStream.value = canvasPreviewRef.value.captureStream(30)
  destination.value = audio.getAudioContext().createMediaStreamDestination()
  const gain = audio.getAudioGain()

  gain.connect(destination.value)

  destination.value.stream.getAudioTracks().forEach((track) => {
    if (track.readyState == 'live') {
      canvasStream.value.addTrack(track)
    }
  })

  videoPreviewRef.value.srcObject = canvasStream.value
  videoPreviewRef.value.play()
}

function closeVideoPreview() {
  videoPreviewRef.value.pause()
  videoPreviewRef.value.srcObject = null

  audio.getAudioGain().disconnect(destination.value)
  canvasStream.value.getTracks().forEach((track) => track.stop())

  canvasStream.value = null
  destination.value = null
}

watch(
  () => preview.getVideoPreviewStatus(),
  (enabled) => {
    if (enabled) {
      playVideoPreview()
    } else {
      closeVideoPreview()
    }
  }
)

onMounted(() => {
  canvasRendering.setCtx(canvasPreviewRef.value)
  canvasRendering.render()
  preview.startPreviewListener()
})

onBeforeUnmount(() => {
  preview.destroyPreviewListener()
  closeVideoPreview()
})
</script>
