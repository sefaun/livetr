<template>
  <img :src="TestImage" @load="loaded(true)" @error="loaded(false)" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageNotFound from '@/assets/image-not-found.png'
import TestImage from '@/assets/test-image.png'

const props = defineProps({
  index: {
    type: Number,
    default: 0,
    required: true,
  },
})

const src = ref('')

function loaded(value: boolean) {
  if (!value) {
    src.value = ImageNotFound
  }
}
</script>
