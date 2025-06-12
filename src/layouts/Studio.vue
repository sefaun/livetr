<template>
  <div class="relative w-full h-screen z-9">
    <StudioNavbar></StudioNavbar>
    <router-view></router-view>
  </div>
  <div>
    <Preview />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useFile } from '@/composables/File'
import { useAudio } from '@/composables/Audio'
import StudioNavbar from '@/layouts/studio/Navbar.vue'
import Preview from '@/components/Preview.vue'
import { activeScene, studioData } from '@/state'

const file = useFile()
const audio = useAudio()

file.createDefaultDirs()
file.getDefaultNodes()
file.getStudioData()

if (!studioData.value.scene[activeScene.value]) {
  activeScene.value = studioData.value.scene.length - 1
  localStorage.setItem(import.meta.env.VITE_ACTIVE_SCENE, activeScene.value.toString())
}

audio.start()

onBeforeUnmount(async () => {
  await audio.destroy()
})
</script>
