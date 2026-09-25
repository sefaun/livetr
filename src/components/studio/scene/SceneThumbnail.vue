<template>
  <canvas
    v-if="props.live"
    ref="liveCanvasRef"
    v-bind="attrs"
    :width="thumbnailSize.width"
    :height="thumbnailSize.height"
  ></canvas>
  <img v-else v-bind="attrs" :src="imageSrc" @error="imageSrc = ImageNotFound" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { useScene, thumbnailSize } from '@/composables/Scene'
import { canvasPreviewRef } from '@/state'
import ImageNotFound from '@/assets/image-not-found.png'
import DefaultScene from '@/assets/default-scene.png'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  live: {
    type: Boolean,
    default: false,
    required: true,
  },
  sceneId: {
    type: String,
    required: true,
  },
})

const attrs = useAttrs()
const scene = useScene()

const liveCanvasRef = ref<HTMLCanvasElement>()
const imageSrc = ref<string>(DefaultScene)
let timer: ReturnType<typeof setInterval> = null

/**
 * Aktif sahne yayın canvas'ından küçültülerek kopyalanır.
 * (Ayrı bir captureStream açmak her karede tam çözünürlükte görüntü kopyalamak demektir.)
 */
function drawLive() {
  const source = canvasPreviewRef.value
  const target = liveCanvasRef.value
  if (source && target) {
    target.getContext('2d').drawImage(source, 0, 0, target.width, target.height)
  }
}

async function update() {
  clearInterval(timer)
  timer = null

  if (props.live) {
    drawLive()
    timer = setInterval(drawLive, 200)
    return
  }

  imageSrc.value = (await scene.getThumbnail(props.sceneId)) ?? DefaultScene
}

watch([() => props.live, () => props.sceneId], () => nextTick(update), { immediate: true })

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
