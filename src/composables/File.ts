import i18n from '@/locales/i18n'
import { platform } from '@/platform'
import { notify } from '@/composables/Notify'
import { debounce, errorMessage } from '@/composables/utils'
import { defaultNodes, studioData } from '@/state'

const { t } = i18n.global
let lastStudioJson = ''
let lastNodebarJson = ''
let saveErrorShown = false

function reportSaveError(error: unknown) {
  console.error('[store] save failed', error)
  // Otomatik kayıt sık çalışır; aynı hata için bildirim yağmuru oluşmasın.
  if (!saveErrorShown) {
    saveErrorShown = true
    notify('error', errorMessage(error), { title: t('not_saved'), duration: 0 })
  }
}

async function setStudioData() {
  const json = JSON.stringify(studioData.value)
  if (json == lastStudioJson) {
    return
  }

  lastStudioJson = json
  try {
    await platform.store.saveStudio(json)
    saveErrorShown = false
  } catch (error) {
    lastStudioJson = ''
    reportSaveError(error)
  }
}

async function setDefaultNodes() {
  const json = JSON.stringify(defaultNodes.value)
  if (json == lastNodebarJson) {
    return
  }

  lastNodebarJson = json
  try {
    await platform.store.saveNodebar(json)
    saveErrorShown = false
  } catch (error) {
    lastNodebarJson = ''
    reportSaveError(error)
  }
}

const saveStudioLater = debounce(setStudioData, 400)
const saveDefaultNodesLater = debounce(setDefaultNodes, 400)

/**
 * Stüdyo verilerinin (sahneler ve node bar öğeleri) yüklenmesi ve kaydedilmesi.
 * Masaüstünde veriler ana süreç tarafından diske (atomik olarak) yazılır; web ortamında localStorage kullanılır.
 */
export function useFile() {
  async function loadData() {
    const snapshot = await platform.store.load()

    studioData.value = snapshot.studio
    defaultNodes.value = snapshot.nodebar
    lastStudioJson = JSON.stringify(snapshot.studio)
    lastNodebarJson = JSON.stringify(snapshot.nodebar)

    for (const notice of snapshot.notices) {
      notify('warning', t(notice), { duration: 0 })
    }
  }

  /** Bekleyen kayıtları hemen yazar (uygulama kapanırken). */
  function flush() {
    saveStudioLater.flush()
    saveDefaultNodesLater.flush()
  }

  return {
    loadData,
    setStudioData,
    setDefaultNodes,
    saveStudioLater,
    saveDefaultNodesLater,
    flush,
  }
}
