<template>
  <img :src="props.live ? activeSceneSrc : srcSource" @load="loaded(true)" @error="loaded(false)" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { activeSceneSrc } from '@/state'
import { useFile } from '@/composables/File'
import { getCorrectSceneImage } from '@/composables/utils'
import ImageNotFound from '@/assets/image-not-found.png'
import { filePaths } from '@/enums'

const props = defineProps({
  live: {
    type: Boolean,
    default: 0,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
    required: true,
  },
})

const file = useFile()
const src = ref('')

const srcSource = computed(
  () =>
    `data:image/jpeg;base64,${file.readFile(
      file.getDirectoryFromMainFolder(filePaths.scene) + `/${getCorrectSceneImage(props.index)}`,
      'base64'
    )}`
)

function loaded(value: boolean) {
  if (!value) {
    src.value = ImageNotFound
  }
}
</script>
