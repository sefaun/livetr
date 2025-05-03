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
  <div :class="preview.getVideoPreviewStatus() ? 'left-1' : 'left-[9999px]'" class="fixed bottom-1 z-10 border">
    <div class="relative w-full h-full">
      <video ref="videoPreviewRef" width="1280" height="720" controls></video>
      <div class="absolute top-1 right-1">
        <ElButton :icon="Close" @click.stop.left="preview.setVideoPreviewStatus(false)" type="danger" circle></ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { canvasPreviewRef, videoPreviewRef } from '@/state'
import { useCanvasRendering } from '@/composables/CanvasRendering'
import { usePreview } from '@/composables/Preview'
import { ElButton } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

const preview = usePreview()
const canvasRendering = useCanvasRendering()

function playVideoPreview() {
  const canvasStream = canvasPreviewRef.value.captureStream(30)
  videoPreviewRef.value.srcObject = canvasStream
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
