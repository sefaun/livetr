<template>
  <component
    v-bind="attrs"
    :is="props.type"
    :crossorigin="mediaCrossOrigin(currentSrc)"
    :src="currentSrc"
    :poster="poster"
    @error="failed = true"
  />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import type { PropType } from 'vue'
import { platform } from '@/platform'
import { mediaCrossOrigin } from '@/platform/url'
import { mediaTypes } from '@/enums'
import type { TMediaTypes } from '@/types'
import ImageNotFound from '@/assets/image-not-found.png'
import VideoNotFound from '@/assets/video-not-found.jpeg'

defineOptions({
  inheritAttrs: false,
})

/** Resim veya video gösterir; kaynak açılamazsa "bulunamadı" görseli gösterilir. */
const props = defineProps({
  type: {
    type: String as PropType<TMediaTypes>,
    default: mediaTypes.img,
  },
  src: {
    type: String,
    default: '',
    required: true,
  },
})

const attrs = useAttrs()
const failed = ref(false)

watch(
  () => props.src,
  () => (failed.value = false)
)

const currentSrc = computed(() =>
  failed.value && props.type == mediaTypes.img ? ImageNotFound : platform.toMediaUrl(props.src)
)
const poster = computed(() => (failed.value && props.type == mediaTypes.video ? VideoNotFound : undefined))
</script>
