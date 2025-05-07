import { screenNodeTypes } from '@/enums'
import { screenRef, canvasPreviewRef, studioData } from '@/state'
import type { TScreenNodeTypes } from '@/types'

export function removeNode(id: string) {
  const index = studioData.value.nodes.findIndex((item) => item.id == id)
  studioData.value.nodes.splice(index, 1)
}

export function ctrlOrMetaKey(event: KeyboardEvent) {
  return event.ctrlKey || event.metaKey
}

export function activeStyles() {
  screenRef.value.style.cursor = 'move'
}

export function passiveStyles() {
  screenRef.value.style.cursor = 'default'
}

export function fixPositionWidthForCanvas(width: number) {
  return (canvasPreviewRef.value.getBoundingClientRect().width * width) / screenRef.value.getBoundingClientRect().width
}

export function fixPositionHeightForCanvas(height: number) {
  return (
    (canvasPreviewRef.value.getBoundingClientRect().height * height) / screenRef.value.getBoundingClientRect().height
  )
}

export function isMediaNode(type: TScreenNodeTypes) {
  return type == screenNodeTypes.video || type == screenNodeTypes.sourceMedia || type == screenNodeTypes.liveCamera
}
