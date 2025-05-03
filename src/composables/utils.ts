import { screenNodeTypes } from '@/enums'
import { screenRef, canvasPreviewRef } from '@/state'
import type { TScreenNodeTypes } from '@/types'

export const ctrlOrMetaKey = (event: KeyboardEvent) => event.ctrlKey || event.metaKey

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
