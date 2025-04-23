<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/Theme'
import { useEventEmitter } from '@/composables/EventEmitter'
import type { TTheme, TLocale } from '@/types'

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

onBeforeMount(() => {
  languageOperations()
  themeOperations()
  eventEmitter.start()
})
</script>
