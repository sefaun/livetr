/** Ana süreçte gösterilen diyalog metinleri. Dil, renderer'dan (arayüz dili) bildirilir. */
const messages = {
  en: {
    liveQuitTitle: 'You are live',
    liveQuitDetail: 'Closing Livetr will end the live stream.',
    liveQuitConfirm: 'End stream and quit',
    cancel: 'Cancel',
    crashTitle: 'Studio stopped unexpectedly',
    crashDetail: 'The studio window stopped working. If a live stream was running, it has been ended.',
    reload: 'Reload',
    close: 'Close',
  },
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
}

let locale = 'en'

function setLocale(value) {
  if (Object.hasOwn(messages, value)) {
    locale = value
  }
}

function t(key) {
  return messages[locale][key] ?? messages.en[key] ?? key
}

module.exports = { setLocale, t }
