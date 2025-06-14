<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { activeScene, channel } from '@/state'
import { useTheme } from '@/composables/Theme'
import { useLive } from '@/composables/Live'
import { fps, resolutions, localeNames } from '@/enums'
import type { TTheme, TLocale, TChannels, TLiveResolution } from '@/types'

const { locale } = useI18n()
const theme = useTheme()
const live = useLive()

function themeOperations() {
  const themeType = localStorage.getItem(import.meta.env.VITE_THEME) as TTheme
  theme.setTheme(themeType == theme.dark ? true : false)
}

function languageOperations() {
  const lang = localStorage.getItem(import.meta.env.VITE_LANG) as TLocale
  locale.value = lang ? lang : localeNames.en
  localStorage.setItem(import.meta.env.VITE_LANG, locale.value)
}

function channelOperations() {
  channel.value = (localStorage.getItem(import.meta.env.VITE_CHANNEL) as TChannels) ?? ('' as any)
}

function streamOperations() {
  let localFPS = localStorage.getItem(import.meta.env.VITE_STREAM_FPS)
  let localResolution = localStorage.getItem(import.meta.env.VITE_STREAM_RESOLUTION) as TLiveResolution
  let activeSceneIndex = localStorage.getItem(import.meta.env.VITE_ACTIVE_SCENE)
  const rtmpURL = localStorage.getItem(import.meta.env.VITE_RTMP_URL) ?? ''
  const rtmpKey = localStorage.getItem(import.meta.env.VITE_RTMP_KEY) ?? ''

  if (!localFPS) {
    localFPS = fps[0].toString()
    localStorage.setItem(import.meta.env.VITE_STREAM_FPS, localFPS)
  }

  if (!localResolution) {
    localResolution = resolutions['480p']
    localStorage.setItem(import.meta.env.VITE_STREAM_RESOLUTION, localResolution)
  }

  if (!activeSceneIndex) {
    activeSceneIndex = '0'
    localStorage.setItem(import.meta.env.VITE_ACTIVE_SCENE, activeSceneIndex)
  }

  activeScene.value = Number(activeSceneIndex)
  live.setLiveOptions({
    rtmpKey,
    fps: Number(localFPS),
    rtmp: rtmpURL,
    resolution: localResolution,
  })
}

onBeforeMount(() => {
  languageOperations()
  themeOperations()
  channelOperations()
  streamOperations()
})
</script>
