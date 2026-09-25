import { screenNodeTypes, stageSize } from '@/enums'
import { screenRef, studioData, defaultNodes, activeScene, stageScale } from '@/state'
import type { TLiveResolution, TScreenNodeTypes } from '@/types'

export function removeNode(id: string) {
  const nodes = studioData.value.scene[activeScene.value]?.nodes
  const index = nodes ? nodes.findIndex((item) => item.id == id) : -1

  if (index != -1) {
    nodes.splice(index, 1)
  }
}

export function removeDefaultNode(id: string) {
  const index = defaultNodes.value.findIndex((item) => item.id == id)

  if (index != -1) {
    defaultNodes.value.splice(index, 1)
  }
}

export function ctrlOrMetaKey(event: KeyboardEvent) {
  return event.ctrlKey || event.metaKey
}

export function activeStyles() {
  if (screenRef.value) {
    screenRef.value.style.cursor = 'move'
  }
}

export function passiveStyles() {
  if (screenRef.value) {
    screenRef.value.style.cursor = 'default'
  }
}

/** Ekrandaki (client) fare konumunu sahnenin mantıksal koordinatına çevirir. */
export function clientToStage(clientX: number, clientY: number) {
  const rect = screenRef.value.getBoundingClientRect()
  const scale = stageScale.value || 1

  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
  }
}

/** Node'un sahne içinde kalması gereken en küçük kısmı (mantıksal piksel). */
const VISIBLE_EDGE = 24

/**
 * Node konumunu, en az bir kısmı sahnede görünür kalacak şekilde sınırlar.
 * Sahnenin tamamen dışına çıkan bir node seçilemez ve geri alınamaz hâle gelirdi.
 */
export function clampToStage(x: number, y: number, width: number, height: number) {
  return {
    x: Math.round(Math.min(Math.max(x, VISIBLE_EDGE - width), stageSize.width - VISIBLE_EDGE)),
    y: Math.round(Math.min(Math.max(y, VISIBLE_EDGE - height), stageSize.height - VISIBLE_EDGE)),
  }
}

export function isMediaNode(type: TScreenNodeTypes) {
  return type == screenNodeTypes.video || type == screenNodeTypes.sourceMedia || type == screenNodeTypes.liveCamera
}

/** Düz JSON verisinin (node, sahne) derin kopyası. Vue reaktif nesnelerinde de çalışır. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function parseResolution(value: TLiveResolution) {
  const [width, height] = value.split(':').map(Number)
  return { width, height }
}

/** Sunucu adresi ile yayın anahtarını birleştirir (sondaki/baştaki "/" ve boşluklar temizlenir). */
export function joinStreamUrl(serverUrl: string, streamKey: string) {
  const url = serverUrl.trim().replace(/\/+$/, '')
  const key = streamKey.trim().replace(/^\/+/, '')

  return key ? `${url}/${key}` : url
}

export function isValidServerUrl(value: string) {
  return /^rtmps?:\/\/[^\s/?#]+(\/\S*)?$/i.test(value.trim())
}

export function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  // ipcRenderer.invoke hataları "Error invoking remote method 'kanal': Error: mesaj" şeklinde gelir.
  return message.replace(/^Error invoking remote method '[^']+': (\w*Error: )?/, '')
}

export function debounce<T extends (...args: any[]) => void>(callback: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> = null

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      callback(...args)
    }, wait)
  }

  /** Bekleyen çağrıyı hemen çalıştırır. */
  debounced.flush = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
      callback(...args)
    }
  }

  return debounced
}
