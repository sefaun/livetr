<template>
  <div class="relative w-full h-screen z-9">
    <StudioNavbar></StudioNavbar>
    <router-view></router-view>
  </div>
  <div
    :class="canvasRendering.getCanvasStatus() ? 'left-1' : 'left-[9999px]'"
    class="fixed bottom-1 z-10 border border-amber-300"
  >
    <canvas ref="canvasRef" width="1280" height="720"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { canvasRef } from '@/state'
import { useCanvasRendering } from '@/composables/CanvasRendering'
import StudioNavbar from '@/layouts/studio/Navbar.vue'

const canvasRendering = useCanvasRendering()

onMounted(() => {
  canvasRendering.setCtx(canvasRef.value)
  canvasRendering.render()
  canvasRendering.canvasPreview()
})
</script>
