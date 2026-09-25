<template>
  <div
    v-for="handle of handles"
    :key="handle"
    :class="`resizer resizer-${handle}`"
    @mousedown.stop.prevent.left="startResize($event, handle)"
  ></div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount } from 'vue'
import { stageScale } from '@/state'
import { NodeId } from '@/enums'
import { clampToStage } from '@/composables/utils'

const handles = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'] as const
type THandle = (typeof handles)[number]

/** Node'un küçültülebileceği en küçük boyut (mantıksal piksel). */
const MIN_SIZE = 16

const node = inject(NodeId)

let start: {
  handle: THandle
  clientX: number
  clientY: number
  width: number
  height: number
  x: number
  y: number
} = null

function startResize(event: MouseEvent, handle: THandle) {
  const element = node.getNodeElement()
  const options = node.getNodeOptions()

  start = {
    handle,
    clientX: event.clientX,
    clientY: event.clientY,
    width: element.offsetWidth,
    height: element.offsetHeight,
    x: options.position.x,
    y: options.position.y,
  }

  window.addEventListener('mousemove', resizing)
  window.addEventListener('mouseup', stopResize, true)
}

function resizing(event: MouseEvent) {
  if (!start) {
    return
  }

  const scale = stageScale.value || 1
  const dx = (event.clientX - start.clientX) / scale
  const dy = (event.clientY - start.clientY) / scale
  const options = node.getNodeOptions()

  let width = start.width
  let height = start.height

  if (start.handle.includes('right')) width = start.width + dx
  if (start.handle.includes('left')) width = start.width - dx
  if (start.handle.includes('bottom')) height = start.height + dy
  if (start.handle.includes('top')) height = start.height - dy

  width = Math.round(Math.max(MIN_SIZE, width))
  height = Math.round(Math.max(MIN_SIZE, height))

  // Sol/üst kenardan boyutlandırırken karşı kenar sabit kalır.
  const x = start.handle.includes('left') ? start.x + start.width - width : start.x
  const y = start.handle.includes('top') ? start.y + start.height - height : start.y
  const position = clampToStage(x, y, width, height)

  options.position.x = position.x
  options.position.y = position.y
  options.style.width = `${width}px`
  options.style.height = `${height}px`
}

function stopResize() {
  start = null
  window.removeEventListener('mousemove', resizing)
  window.removeEventListener('mouseup', stopResize, true)
}

onBeforeUnmount(() => {
  stopResize()
})
</script>
