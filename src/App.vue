<template>
  <router-view />
  <div class="fixed bottom-4 left-4">
    <Theme />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useTheme } from '@/composables/Theme'
import type { TTheme } from '@/types'
import Theme from '@/components/Theme.vue'

const theme = useTheme()

function themeOperations() {
  const themeType = localStorage.getItem(import.meta.env.VITE_THEME) as TTheme
  theme.setTheme(themeType == theme.dark ? true : false)
}


onBeforeMount(() => {
  themeOperations()
})
</script>
