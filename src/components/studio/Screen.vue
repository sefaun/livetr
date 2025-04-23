<template>
  <div
    ref="screenRef"
    @dragenter.prevent="dragdrop.dragenter"
    @dragover.prevent="dragdrop.dragover"
    @dragleave="dragdrop.dragleave"
    @drop.prevent="dragdrop.drop"
    class="w-full border aspect-video"
  >
    <div>asdsa</div>
  </div>
</template>

<script setup lang="ts">
import { screenRef } from '@/state'
import { useDragDrop } from '@/composables/DragDrop'

const dragdrop = useDragDrop()
</script>
