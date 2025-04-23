<template>
  <div class="w-full flex h-[calc(100vh-var(--studio-navbar-height)-var(--studio-footer-height))]">
    <div class="w-[65%] flex items-center border-r-2 p-3 overflow-y-auto">
      <Screen></Screen>
    </div>
    <div class="w-[35%] p-3 overflow-y-auto">items</div>
  </div>
  <div class="w-full h-[var(--studio-footer-height)] border-t-2 p-2 overflow-x-auto">asd</div>
</template>

<script setup lang="ts">
import Screen from '@/components/studio/Screen.vue'
</script>
