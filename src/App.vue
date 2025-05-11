<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { channel } from '@/state'
import { useTheme } from '@/composables/Theme'
import { useFile } from '@/composables/File'
import { useEventEmitter } from '@/composables/EventEmitter'
import { useLive } from '@/composables/Live'
import { channelRTMP, fps, resolutions } from '@/enums'
import type { TTheme, TLocale, TChannels, TLiveResolution } from '@/types'

const { locale } = useI18n()
const theme = useTheme()
const file = useFile()
const eventEmitter = useEventEmitter()
const live = useLive()

function themeOperations() {
  const themeType = localStorage.getItem(import.meta.env.VITE_THEME) as TTheme
  theme.setTheme(themeType == theme.dark ? true : false)
}

function languageOperations() {
  const lang = localStorage.getItem(import.meta.env.VITE_LANG) as TLocale
  locale.value = lang ? lang : 'en'
  localStorage.setItem(import.meta.env.VITE_LANG, locale.value)
}

function channelOperations() {
  channel.value = (localStorage.getItem(import.meta.env.VITE_CHANNEL) as TChannels) ?? ('' as any)
}

function streamOperations() {
  let localFPS = localStorage.getItem(import.meta.env.VITE_STREAM_FPS)
  let localResolution = localStorage.getItem(import.meta.env.VITE_STREAM_RESOLUTION) as TLiveResolution
  const rtmpKey = localStorage.getItem(import.meta.env.VITE_RTMP_KEY) ?? ''

  if (!localFPS) {
    localFPS = fps[0].toString()
    localStorage.setItem(import.meta.env.VITE_STREAM_FPS, localFPS)
  }

  if (!localResolution) {
    localResolution = resolutions['480p']
    localStorage.setItem(import.meta.env.VITE_STREAM_RESOLUTION, localResolution)
  }

  live.setLiveOptions({
    rtmpKey,
    fps: Number(localFPS),
    rtmp: channelRTMP[channel.value] ?? '',
    resolution: localResolution,
  })
}

onBeforeMount(() => {
  languageOperations()
  themeOperations()
  channelOperations()
  streamOperations()
  file.createDefaultDirs()
  file.setDefaultNodes()
  eventEmitter.start()
})
</script>
