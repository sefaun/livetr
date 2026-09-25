<template>
  <div v-if="visible" class="flex items-center gap-2 text-xs leading-tight select-none">
    <span
      :class="connected ? 'bg-red-600' : 'bg-gray-500'"
      class="inline-flex items-center gap-1 rounded px-2 py-1 font-bold text-white"
    >
      <span :class="connected ? 'animate-pulse' : ''" class="w-2 h-2 rounded-full bg-white"></span>
      {{ t('live') }}
    </span>
    <div class="font-mono tabular-nums min-w-[92px]">
      <div>{{ duration }}</div>
      <div class="opacity-75">{{ bitrate }} · {{ frameRate }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLive } from '@/composables/Live'
import { liveConnectionTypes } from '@/enums'

const { t } = useI18n()
const live = useLive()

const visible = computed(() => live.getLiveStatus() != liveConnectionTypes.connect)
const connected = computed(() => live.getLiveStatus() == liveConnectionTypes.connected)

/** Yayına gönderilen süre (ffmpeg çıkış zaman damgası). */
const duration = computed(() => {
  const totalSeconds = Math.floor((live.getLiveStats()?.outTimeMs ?? 0) / 1000)
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`
})

const bitrate = computed(() => {
  const kbps = live.getLiveStats()?.bitrate ?? 0
  if (kbps <= 0) {
    // Yerel kayıt açıkken (tee) ffmpeg gönderilen boyutu raporlamaz.
    return '— kbps'
  }

  return kbps >= 1000 ? `${(kbps / 1000).toFixed(1)} Mbps` : `${Math.round(kbps)} kbps`
})

const frameRate = computed(() => `${Math.round(live.getLiveStats()?.fps ?? 0)} fps`)
</script>
