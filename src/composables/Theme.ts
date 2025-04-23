import type { Ref } from 'vue'
import { ref } from 'vue'
import type { TTheme } from '@/types'

const themeStatus: Ref<boolean> = ref(false)

export function useTheme() {
  const dark = 'dark' as const
  const light = 'light' as const

  function getThemeStatus(): boolean {
    return themeStatus.value
  }

  function setThemeStatus(value: boolean): void {
    themeStatus.value = value
  }

  function setTheme(value: boolean): void {
    setThemeStatus(value)
    localStorage.setItem(import.meta.env.VITE_THEME, getLocalStorageData())

    if (value === true) {
      document.documentElement.classList.add(dark)
    }

    if (value === false) {
      document.documentElement.classList.remove(dark)
    }
  }

  function setLocalStorageData(value: TTheme) {
    localStorage.setItem(import.meta.env.VITE_THEME, value)
  }

  function getLocalStorageData(): string {
    return themeStatus.value === true ? dark : light
  }

  function checkLocalStorageTheme() {
    const theme = localStorage.getItem(import.meta.env.VITE_THEME)

    if (!theme || theme === light) {
      setLocalStorageData(light)
      setThemeStatus(false)
    } else if (theme === dark) {
      setLocalStorageData(dark)
      setThemeStatus(true)
    } else {
      setLocalStorageData(light)
      setThemeStatus(false)
    }

    setTheme(getThemeStatus())
  }

  return {
    dark,
    light,
    getThemeStatus,
    setTheme,
    checkLocalStorageTheme,
  }
}
