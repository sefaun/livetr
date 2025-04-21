<template>
  <ElButton @click="theme.setTheme(!theme.getThemeStatus())" :icon="theme.getThemeStatus() ? Sunny : Moon" circle />
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/Theme'

const theme = useTheme()
</script>
