import { createI18n } from 'vue-i18n'
import { localeNames } from '@/enums'
import { readSetting } from '@/settings'
import type { TLocale } from '@/types'

import en from '@/locales/lang/en.json'
import tr from '@/locales/lang/tr.json'

function detectLocale(): TLocale {
  const stored = readSetting('lang')
  if (stored == localeNames.tr || stored == localeNames.en) {
    return stored
  }

  return navigator.language?.toLowerCase().startsWith(localeNames.tr) ? localeNames.tr : localeNames.en
}

export default createI18n({
  locale: detectLocale(),
  fallbackLocale: localeNames.en,
  globalInjection: true,
  legacy: false,
  messages: {
    en,
    tr,
  },
})
