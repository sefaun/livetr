import { screenRef } from '@/state'

export const ctrlOrMetaKey = (event: MouseEvent) => event.ctrlKey || event.metaKey

export function activeStyles() {
  screenRef.value.style.cursor = 'grabbing'
}

export function passiveStyles() {
  screenRef.value.style.cursor = 'grab'
}
