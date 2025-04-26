import { screenRef } from '@/state'

export const ctrlOrMetaKey = (event: MouseEvent) => event.ctrlKey || event.metaKey

export function activeStyles() {
  screenRef.value.style.cursor = 'move'
}

export function passiveStyles() {
  screenRef.value.style.cursor = 'default'
}

//TODO: ekran değişikliklerine göre canvastaki görüntü bozulmaması için
function fixCanvasWidthPosition(width: number) {
  return (1280 * width) / screenRef.value.getBoundingClientRect().width
}

function fixCanvasHeightPosition(width: number) {
  return (720 * width) / screenRef.value.getBoundingClientRect().height
}
