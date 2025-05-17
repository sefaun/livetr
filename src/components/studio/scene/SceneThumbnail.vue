<template>
  <video
    v-if="sourceStatus && props.live"
    ref="videoThumbnailRef"
    v-bind="attrs"
    @load="loaded(true)"
    @error="loaded(false)"
    autoplay
    muted
  ></video>
  <img
    v-if="sourceStatus && !props.live && srcSource"
    v-bind="attrs"
    :src="srcSource"
    @load="loaded(true)"
    @error="loaded(false)"
  />
  <img v-if="!sourceStatus" v-bind="attrs" :src="ImageNotFound" @load="loaded(true)" @error="loaded(false)" />
</template>

<script setup lang="ts">
import { onMounted, ref, useAttrs, watch, nextTick } from 'vue'
import { useFile } from '@/composables/File'
import { canvasPreviewRef, studioData } from '@/state'
import { filePaths } from '@/enums'
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
  index: {
    type: Number,
    required: true,
  },
})

const attrs = useAttrs()
const file = useFile()

let sourceStatus = true
const videoThumbnailRef = ref<HTMLVideoElement>()
const srcSource = ref('')

watch([() => props.live, () => props.index], () => {
  nextTick(() => {
    if (props.live) {
      renderVideo()
    } else {
      renderImage()
    }
  })
})

function loaded(value: boolean) {
  sourceStatus = value
}

function renderImage() {
  const path = file.getDirectoryFromMainFolder(filePaths.scene) + `/${studioData.value.scene[props.index].sceneId}.png`
  const exist = file.fs.existsSync(path)

  if (exist) {
    srcSource.value = `data:image/png;base64,${file.fs.readFileSync(path, 'base64')}`
  } else {
    srcSource.value = DefaultScene
  }
}

function renderVideo() {
  videoThumbnailRef.value.srcObject = canvasPreviewRef.value.captureStream(30)
}

onMounted(() => {
  if (props.live) {
    renderVideo()
  } else {
    renderImage()
  }
})
</script>
