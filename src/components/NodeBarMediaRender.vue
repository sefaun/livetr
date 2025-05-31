<template>
  <component
    v-bind="attrs"
    :is="props.type"
    :src="src"
    :poster="poster"
    @load="props.type == mediaTypes.img ? () => loaded(true) : undefined"
    @loadeddata="props.type == mediaTypes.video ? () => loaded(true) : undefined"
    @error="() => loaded(false)"
  />
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import type { PropType } from 'vue'
import { mediaTypes } from '@/enums'
import type { TMediaTypes } from '@/types'
import ImageNotFound from '@/assets/image-not-found.png'
import VideoNotFound from '@/assets/video-not-found.jpeg'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  type: {
    type: String as PropType<TMediaTypes>,
    default: 'img',
  },
  src: {
    type: String,
    default: '',
    required: true,
  },
})

const attrs = useAttrs()

const src = ref(props.src)
const poster = ref('')

function loaded(value: boolean) {
  if (!value) {
    if (props.type == mediaTypes.img) {
      src.value = ImageNotFound
    }

    if (props.type == mediaTypes.video) {
      poster.value = VideoNotFound
    }
  }
}
</script>
