import type { Ref } from 'vue'
import { ref } from 'vue'
import { writeSetting } from '@/settings'

const themeStatus: Ref<boolean> = ref(false)

export function useTheme() {
  const dark = 'dark' as const
  const light = 'light' as const

  function getThemeStatus(): boolean {
    return themeStatus.value
  }

  function setTheme(value: boolean): void {
    themeStatus.value = value
    writeSetting('theme', value ? dark : light)
    document.documentElement.classList.toggle(dark, value)
  }

  return {
    dark,
    light,
    getThemeStatus,
    setTheme,
  }
}
