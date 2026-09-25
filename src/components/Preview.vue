<template>
  <div
    :class="preview.getCanvasPreviewStatus() ? 'left-1' : 'left-[9999px]'"
    class="fixed bottom-1 z-10 border border-amber-300 pointer-events-none"
  >
    <div class="relative w-full h-full">
      <!-- Yayına giden görüntü bu canvas'a, seçilen yayın çözünürlüğünde çizilir. -->
      <canvas
        ref="canvasPreviewRef"
        :width="output.width"
        :height="output.height"
        class="block w-[640px] h-auto"
      ></canvas>
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
    <div v-show="preview.getVideoPreviewStatus()" class="fixed top-0 left-0 w-full h-full bg-black/75 z-10">
      <div class="relative w-full h-full flex justify-center items-center p-4">
        <video ref="videoPreviewRef" controls class="w-[1280px] max-w-full max-h-full aspect-video bg-black"></video>
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
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { ElButton } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { canvasPreviewRef, videoPreviewRef } from '@/state'
import { useCanvasRendering } from '@/composables/CanvasRendering'
import { useAudio } from '@/composables/Audio'
import { useLive } from '@/composables/Live'
import { usePreview } from '@/composables/Preview'
import { parseResolution } from '@/composables/utils'

const preview = usePreview()
const audio = useAudio()
const live = useLive()
const canvasRendering = useCanvasRendering()

const output = computed(() => parseResolution(live.getLiveOptions().resolution))

let previewStream: MediaStream = null
let previewDestination: MediaStreamAudioDestinationNode = null

/** Yayına gidecek görüntü ve sesi (canvas + ses mikseri) oynatarak önizler. */
async function playVideoPreview() {
  closeVideoPreview()
  await audio.resume()

  previewStream = canvasPreviewRef.value.captureStream(live.getLiveOptions().fps)
  previewDestination = audio.createStreamDestination()
  previewDestination.stream.getAudioTracks().forEach((track) => previewStream.addTrack(track))

  videoPreviewRef.value.srcObject = previewStream
  videoPreviewRef.value.play().catch(() => {})
}

function closeVideoPreview() {
  if (!previewStream) {
    return
  }

  videoPreviewRef.value?.pause()
  if (videoPreviewRef.value) {
    videoPreviewRef.value.srcObject = null
  }

  previewStream.getTracks().forEach((track) => track.stop())
  audio.releaseStreamDestination(previewDestination)
  previewStream = null
  previewDestination = null
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
  canvasRendering.start(() => live.getLiveOptions().fps)
  preview.startPreviewListener()
})

onBeforeUnmount(() => {
  canvasRendering.stop()
  preview.destroyPreviewListener()
  closeVideoPreview()
})
</script>
