<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { channel } from '@/state'
import { useTheme } from '@/composables/Theme'
import { useEventEmitter } from '@/composables/EventEmitter'
import type { TTheme, TLocale, TChannels } from '@/types'

const { locale } = useI18n()
const theme = useTheme()
const eventEmitter = useEventEmitter()

function themeOperations() {
  const themeType = localStorage.getItem(import.meta.env.VITE_THEME) as TTheme
  theme.setTheme(themeType == theme.dark ? true : false)
}

function languageOperations() {
  const lang = localStorage.getItem(import.meta.env.VITE_LANG) as TLocale
  locale.value = lang ? lang : 'en'
  localStorage.setItem(import.meta.env.VITE_LANG, locale.value)
}

function streamOperations() {
  const fps = Number(localStorage.getItem(import.meta.env.VITE_STREAM_FPS) ?? 30)
  localStorage.setItem(import.meta.env.VITE_STREAM_FPS, fps.toString())
}

function channelOperations() {
  channel.value = (localStorage.getItem(import.meta.env.VITE_CHANNEL) as TChannels) ?? ('' as any)
}

onBeforeMount(() => {
  languageOperations()
  themeOperations()
  channelOperations()
  streamOperations()
  eventEmitter.start()
})
</script>
