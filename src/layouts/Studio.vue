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
import StudioNavbar from '@/layouts/studio/Navbar.vue'
import Preview from '@/components/Preview.vue'
</script>
