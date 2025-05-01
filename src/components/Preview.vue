<template>
  <div
    :class="preview.getCanvasPreviewStatus() ? 'left-1' : 'left-[9999px]'"
    class="fixed bottom-1 z-10 border border-amber-300 pointer-events-none"
  >
    <canvas ref="canvasPreviewRef" width="1280" height="720"></canvas>
  </div>
  <div :class="preview.getVideoPreviewStatus() ? 'left-1' : 'left-[9999px]'" class="fixed bottom-1 z-10 border">
    <video ref="videoPreviewRef" width="1280" height="720" controls></video>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { canvasPreviewRef, videoPreviewRef } from '@/state'
import { useCanvasRendering } from '@/composables/CanvasRendering'
import { usePreview } from '@/composables/Preview'

const preview = usePreview()
const canvasRendering = useCanvasRendering()

function playVideoPreview() {
  videoPreviewRef.value.srcObject = canvasPreviewRef.value.captureStream(30)
}

onMounted(() => {
  canvasRendering.setCtx(canvasPreviewRef.value)
  canvasRendering.render()
  preview.startPreviewListener()
  playVideoPreview()
})

onBeforeUnmount(() => {
  preview.destroyPreviewListener()
})
</script>
