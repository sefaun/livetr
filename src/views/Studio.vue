<template>
  <div class="w-full flex h-[calc(100vh-var(--studio-navbar-height)-var(--studio-footer-height))]">
    <div class="w-[65%] border-r-2 border-[var(--border-color)] dark:border-[--border-dark-color] p-3 overflow-y-auto">
      <Screen />
    </div>
    <div class="w-[35%] p-3 overflow-y-auto">
      <NodeBar />
    </div>
  </div>
  <div
    class="w-full h-[var(--studio-footer-height)] border-t-2 border-[var(--border-color)] dark:border-[--border-dark-color] p-2 overflow-x-auto"
  >
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Screen from '@/components/studio/Screen.vue'
import NodeBar from '@/components/studio/NodeBar.vue'
import Footer from '@/components/studio/Footer.vue'
</script>
