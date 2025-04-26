<template>
  <div class="relative w-full h-screen z-9">
    <StudioNavbar></StudioNavbar>
    <router-view></router-view>
  </div>
  <div v-show="canvasRendering.getCanvasStatus()" class="fixed bottom-2 right-2 z-10 border border-amber-300">
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
