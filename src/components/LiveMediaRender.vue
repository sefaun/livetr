<template>
  <video
    ref="mediaRef"
    v-bind="attrs"
    :src="fileSrc"
    :poster="poster"
    @loadedmetadata="onLoadedMetadata"
    @error="onError"
    playsinline
    class="w-full h-full"
  ></video>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, inject, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { platform } from '@/platform'
import { useLiveMedia } from '@/composables/LiveMedia'
import { useLive } from '@/composables/Live'
import { notify } from '@/composables/Notify'
import { removeNode } from '@/composables/utils'
import { NodeId } from '@/enums'
import VideoNotFound from '@/assets/video-not-found.jpeg'

defineOptions({
  inheritAttrs: false,
})

/**
 * Sahnedeki video kaynakları: dosya videosu (src), kamera (liveId) veya ekran/pencere (sourceId).
 * Kaynağın sesi, node'un ses kanalı üzerinden stüdyo mikserine bağlanır.
 */
const props = defineProps({
  src: {
    type: String,
    default: '',
    required: false,
  },
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
const live = useLive()

let stream: MediaStream = null
let unmounted = false
const mediaRef = ref<HTMLVideoElement>()
const poster = ref<string>()
const fileSrc = computed(() => (props.src ? platform.toMediaUrl(props.src) : undefined))

function onLoadedMetadata() {
  poster.value = undefined
  if (props.src) {
    node.getNodeAudio().attach(mediaRef.value)
  }
}

function onError() {
  if (!props.src) {
    return
  }

  // Dosya bulunamasa da node silinmez; kullanıcı düzeltebilir ya da kendisi kaldırabilir.
  poster.value = VideoNotFound
  notify('error', `${t('wrong_video_content')}: ${props.src}`)
}

async function openLiveSource() {
  try {
    stream = await liveMedia.getUserMedia(
      { liveId: props.liveId, sourceId: props.sourceId },
      { fps: live.getLiveOptions().fps }
    )
  } catch (error) {
    console.warn('[media] live source could not be opened', error)
    if (!unmounted) {
      // Pencere kapanmış ya da cihaz çıkarılmış olabilir.
      notify('error', t('stream_not_found'))
      removeNode(node.getNodeOptions().id)
    }
    return
  }

  if (unmounted) {
    stream.getTracks().forEach((track) => track.stop())
    return
  }

  mediaRef.value.srcObject = stream
  node.getNodeAudio().attach(stream)
}

onMounted(() => {
  if (!props.src) {
    openLiveSource()
  }
})

onBeforeUnmount(() => {
  unmounted = true
  stream?.getTracks().forEach((track) => track.stop())
  if (mediaRef.value) {
    mediaRef.value.srcObject = null
  }
})
</script>
