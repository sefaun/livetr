import { screenRef, canvasRef } from '@/state'

export const ctrlOrMetaKey = (event: MouseEvent) => event.ctrlKey || event.metaKey

export function activeStyles() {
  screenRef.value.style.cursor = 'move'
}

export function passiveStyles() {
  screenRef.value.style.cursor = 'default'
}

export function fixPositionWidthForCanvas(width: number) {
  return (canvasRef.value.getBoundingClientRect().width * width) / screenRef.value.getBoundingClientRect().width
}

export function fixPositionHeightForCanvas(height: number) {
  return (canvasRef.value.getBoundingClientRect().height * height) / screenRef.value.getBoundingClientRect().height
}
