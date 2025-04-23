import { createI18n } from 'vue-i18n'

import en from '@/locales/lang/en.json'
import tr from '@/locales/lang/tr.json'

export default createI18n({
  locale: localStorage.getItem(import.meta.env.VITE_APP_LANGUAGE) || 'tr',
  fallbackLocale: 'tr',
  globalInjection: true,
  legacy: false,
  messages: {
    en,
    tr,
  },
})
