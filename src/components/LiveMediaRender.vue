<template>
  <video ref="mediaRef" v-bind="attrs" @load="loaded(true)" @error="loaded(false)" class="w-full h-full"></video>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, inject, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import { useLiveMedia } from '@/composables/LiveMedia'
import { NodeId } from '@/enums'
import { removeNode } from '@/composables/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  sourceId: {
    type: String,
    default: '',
    required: false,
  },
  liveId: {
    type: String,
    default: '',
    required: false,
  },
})

const node = inject(NodeId)

const attrs = useAttrs()
const { t } = useI18n()
const liveMedia = useLiveMedia()

let stream: MediaStream
const mediaRef = ref<HTMLVideoElement>()
const srcStatus = ref(attrs.src ? true : false)
const srcVideoEnded = ref(true)

function loaded(value: boolean) {
  if (!value) {
    ElNotification({
      type: 'error',
      message: t('wrong_video_content'),
    })
    removeNode(node.getNodeOptions().id)
  }
}

async function getUserMedia() {
  try {
    stream = await liveMedia.getUserMedia(props)
  } catch (error) {
    ElNotification({
      type: 'error',
      message: t('stream_not_found'),
    })

    removeNode(node.getNodeOptions().id)
    return
  }

  mediaRef.value.srcObject = stream
  node.getNodeAudio().createAudioStream(stream)
}

function setSrcVideoEnded(value: boolean) {
  srcVideoEnded.value = value
}

async function captureStream(conenctStatus: boolean = true) {
  node.getNodeAudio().createAudioStream((mediaRef.value as any).captureStream(), conenctStatus)
  setSrcVideoEnded(false)
}

function ended() {
  setSrcVideoEnded(true)
}

function firstPlay() {
  if (mediaRef.value.currentTime < 0.1 || srcVideoEnded.value) {
    captureStream(true)
  }
}

onMounted(async () => {
  node.getNodeAudio().start()

  if (!srcStatus.value) {
    await getUserMedia()
  }

  if (srcStatus.value) {
    mediaRef.value.addEventListener('play', firstPlay)
    mediaRef.value.addEventListener('ended', ended)
  }
})

onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    mediaRef.value.srcObject = null
  }

  if (srcStatus.value) {
    mediaRef.value.removeEventListener('play', firstPlay)
    mediaRef.value.removeEventListener('ended', ended)
  }
})
</script>
