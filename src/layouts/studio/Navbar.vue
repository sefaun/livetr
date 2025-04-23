<template>
  <div
    class="w-full h-[var(--studio-navbar-height)] bg-pink-200 dark:bg-slate-900 flex items-center justify-between px-4 shadow-md"
  >
    <div class="text-lg font-bold">{{ t('studio') }}</div>
    <div class="font-bold text-3xl text-[var(--primary-color)]">Livetr</div>
    <div class="flex items-center gap-2">
      <Theme />
      <Language />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Theme from '@/components/Theme.vue'
import Language from '@/components/Language.vue'

const { t } = useI18n()
</script>
