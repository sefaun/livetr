/** Ana süreçte gösterilen diyalog metinleri. Dil, renderer'dan (arayüz dili) bildirilir. */

const en = {
  liveQuitTitle: 'You are live',
  liveQuitDetail: 'Closing Livetr will end the live stream.',
  liveQuitConfirm: 'End stream and quit',
  cancel: 'Cancel',
  crashTitle: 'Studio stopped unexpectedly',
  crashDetail: 'The studio window stopped working. If a live stream was running, it has been ended.',
  reload: 'Reload',
  close: 'Close',
}

type TMessageKey = keyof typeof en

/** Her dil, İngilizcedeki tüm anahtarları içermek zorundadır (eksik çeviri derleme hatasıdır). */
const messages = {
  en,
  tr: {
    liveQuitTitle: 'Canlı yayındasınız',
    liveQuitDetail: 'Livetr kapatılırsa canlı yayın sonlandırılacak.',
    liveQuitConfirm: 'Yayını bitir ve çık',
    cancel: 'Vazgeç',
    crashTitle: 'Stüdyo beklenmedik şekilde kapandı',
    crashDetail: 'Stüdyo penceresi çalışmayı durdurdu. Canlı yayın açıksa sonlandırıldı.',
    reload: 'Yeniden Yükle',
    close: 'Kapat',
  },
} satisfies Record<string, Record<TMessageKey, string>>

type TLocale = keyof typeof messages

let locale: TLocale = 'en'

function isLocale(value: string): value is TLocale {
  return Object.hasOwn(messages, value)
}

export function setLocale(value: string): void {
  if (isLocale(value)) {
    locale = value
  }
}

export function t(key: TMessageKey): string {
  return messages[locale][key]
}
