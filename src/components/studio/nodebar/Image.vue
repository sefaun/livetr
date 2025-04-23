<template>
  <div>
    <div draggable="true" @dragstart="dragdrop.dragstart">resim - 1</div>
  </div>
</template>

<script setup lang="ts">
import { useDragDrop } from '@/composables/DragDrop'

const dragdrop = useDragDrop()
</script>
