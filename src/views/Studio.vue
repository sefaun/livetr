<template>
  <div class="w-full flex flex-1 min-h-0">
    <div class="w-[155px] shrink-0 overflow-y-auto p-2"><Scene /></div>
    <div
      class="flex-1 min-w-0 border-x-2 border-[var(--border-color)] dark:border-(--border-dark-color) p-3 overflow-clip"
    >
      <Screen />
    </div>
    <div class="w-[25%] min-w-[300px] max-w-[440px] shrink-0 p-3 overflow-y-auto">
      <NodeBar />
    </div>
  </div>
  <div
    class="w-full h-[var(--studio-footer-height)] shrink-0 border-t-2 border-[var(--border-color)] dark:border-(--border-dark-color) p-2 overflow-x-auto"
  >
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useScene } from '@/composables/Scene'
import Scene from '@/components/studio/Scene.vue'
import Screen from '@/components/studio/Screen.vue'
import NodeBar from '@/components/studio/NodeBar.vue'
import Footer from '@/components/studio/Footer.vue'

const scene = useScene()

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  // Aktif sahnenin küçük resmi düzenli olarak güncellenir (sahne listesinde gösterilir).
  interval = setInterval(() => {
    scene.saveActiveScreen()
  }, 15000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
  scene.saveActiveScreen()
})
</script>
