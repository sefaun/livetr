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
import { onBeforeUnmount, onMounted } from 'vue'
import { useAudio } from '@/composables/Audio'
import StudioNavbar from '@/layouts/studio/Navbar.vue'
import Preview from '@/components/Preview.vue'

const audio = useAudio()

onMounted(() => {
  audio.start()
})

onBeforeUnmount(async () => {
  await audio.destroy()
})
</script>
