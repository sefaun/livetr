<template>
  <div class="w-full h-full relative overflow-hidden bg-transparent">
    <webview
      v-if="alertData.url && alertData.isActive"
      ref="webviewRef"
      :src="alertData.url"
      :style="{ width: '100%', height: '100%' }"
      :nodeintegration="false"
      :webSecurity="false"
      :allowpopups="false"
      disablewebsecurity
      @dom-ready="onWebviewReady"
      @console-message="onConsoleMessage"
      class="absolute inset-0"
    />
    <video
      v-if="hasMediaStream"
      ref="videoRef"
      autoplay
      muted
      playsinline
      :style="{ width: '100%', height: '100%', objectFit: 'contain' }"
      class="absolute inset-0"
    />
    <div
      v-if="!alertData.isActive"
      class="w-full h-full flex items-center justify-center bg-gray-800 text-white text-sm"
    >
      Alert Widget: {{ alertData.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, inject, watch } from 'vue'
import type { PropType } from 'vue'
import type { TNode, TAlertWidgetNodeData, TuseNode } from '@/types'
import { NodeId } from '@/enums'

const { ipcRenderer } = window.require('electron') as typeof import('electron')

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const node = inject(NodeId) as TuseNode
const webviewRef = ref<Electron.WebviewTag>()
const videoRef = ref<HTMLVideoElement>()
const mediaStream = ref<MediaStream | null>(null)

const alertData = computed(() => props.data.data as TAlertWidgetNodeData)
const hasMediaStream = computed(() => mediaStream.value !== null)

// Watch for mediaStream changes and update video element
watch(mediaStream, (newStream) => {
  if (videoRef.value && newStream) {
    videoRef.value.srcObject = newStream
  }
})

onMounted(() => {
  // Set this element as the node element for canvas rendering
  if (node && videoRef.value) {
    node.setNodeElement(videoRef.value)
  }
})

onBeforeUnmount(() => {
  cleanup()
})

function onWebviewReady() {
  console.log('Webview ready for alert:', alertData.value.title)
  captureWebviewStream()
}

function onConsoleMessage(event: any) {
  console.log('Alert webview console:', event.message)
}

async function captureWebviewStream() {
  try {
    if (!webviewRef.value) return

    // Request stream capture from Electron main process
    const result = await ipcRenderer.invoke('capture-webview-stream', {
      webContentsId: webviewRef.value.getWebContentsId(),
      nodeId: props.data.id,
    })

    if (result.success && result.streamId) {
      // Create media stream from captured stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: result.streamId,
          },
        } as any,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: result.streamId,
            maxWidth: 1920,
            maxHeight: 1080,
          },
        } as any,
      })

      mediaStream.value = stream
      
      // Set video element as node element for canvas rendering
      if (node && videoRef.value) {
        node.setNodeElement(videoRef.value)
      }
    }
  } catch (error) {
    console.error('Failed to capture webview stream:', error)
  }
}

function cleanup() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
}

// Expose methods for external control
defineExpose({
  activate: () => {
    if (node) {
      const nodeData = node.getNodeOptions()
      ;(nodeData.data as TAlertWidgetNodeData).isActive = true
    }
  },
  deactivate: () => {
    if (node) {
      const nodeData = node.getNodeOptions()
      ;(nodeData.data as TAlertWidgetNodeData).isActive = false
    }
    cleanup()
  },
  getVideoElement: () => videoRef.value,
  getWebviewElement: () => webviewRef.value,
})
</script> 