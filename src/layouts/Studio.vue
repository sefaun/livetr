<template>
  <div class="w-full h-screen">
    <StudioNavbar></StudioNavbar>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import StudioNavbar from './studio/Navbar.vue'
</script>
