<template>
  <ElDropdown trigger="click">
    <ElButton :icon="Flag" circle />
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem @click.left="changeLocale(localeNames.tr)" :disabled="locale == localeNames.tr">
          {{ t('turkish') }}
        </ElDropdownItem>
        <ElDropdownItem @click.left="changeLocale(localeNames.en)" :disabled="locale == localeNames.en">
          {{ t('english') }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Flag } from '@element-plus/icons-vue'
import { localeNames } from '@/enums'
import type { TLocale } from '@/types'

const { t, locale } = useI18n()

// Seçilen dil App.vue'de saklanır.
function changeLocale(value: TLocale): void {
  locale.value = value
}
</script>
