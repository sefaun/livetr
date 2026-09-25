<template>
  <ElConfigProvider :locale="elementLocale">
    <router-view />
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElConfigProvider } from 'element-plus'
import tr from 'element-plus/dist/locale/tr.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { platform } from '@/platform'
import { readSetting, writeSetting } from '@/settings'
import { useTheme } from '@/composables/Theme'
import { useLive } from '@/composables/Live'
import { localeNames } from '@/enums'

const { locale } = useI18n()
const theme = useTheme()
const live = useLive()

const elementLocale = computed(() => (locale.value == localeNames.tr ? tr : en))

// Seçilen dil saklanır ve ana sürece (masaüstü diyalogları için) bildirilir.
watch(
  locale,
  (value) => {
    writeSetting('lang', value)
    document.documentElement.lang = value
    platform.setLocale(value)
  },
  { immediate: true }
)

onBeforeMount(() => {
  theme.setTheme(readSetting('theme') == theme.dark)
  live.loadLiveOptions()
})
</script>
