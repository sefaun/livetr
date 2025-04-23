<template>
  <div>
    <div draggable="true" :type="screenNodeTypes.image" @dragstart="dragdrop.dragstart">resim - 1</div>
  </div>
</template>

<script setup lang="ts">
import { useDragDrop } from '@/composables/DragDrop'
import { screenNodeTypes } from '@/enums'

const dragdrop = useDragDrop()
</script>
