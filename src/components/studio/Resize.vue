<template>
  <div class="resizer resizer-top-left"></div>
  <div class="resizer resizer-top"></div>
  <div class="resizer resizer-top-right"></div>
  <div class="resizer resizer-right"></div>
  <div class="resizer resizer-bottom-right"></div>
  <div class="resizer resizer-bottom"></div>
  <div class="resizer resizer-bottom-left"></div>
  <div class="resizer resizer-left"></div>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { screenRef } from '@/state'
import { NodeId } from '@/enums'

const node = inject(NodeId)

let resizers: NodeListOf<HTMLElement>
let originalWidth = 0
let originalHeight = 0
let originalX = 0
let originalY = 0
let originalMouseX = 0
let originalMouseY = 0
let activeResizer: HTMLElement | null = null

function nodeResize() {
  resizers = node.getNodeElement().querySelectorAll('.resizer')

  resizers.forEach((resizer) => {
    resizer.addEventListener('mousedown', function (event: MouseEvent) {
      event.stopPropagation()
      event.preventDefault()

      activeResizer = resizer

      originalWidth = node.getNodeElement().getBoundingClientRect().width
      originalHeight = node.getNodeElement().getBoundingClientRect().height
      originalX = node.getNodeOptions().position.x
      originalY = node.getNodeOptions().position.y
      originalMouseX = event.pageX
      originalMouseY = event.pageY

      screenRef.value.addEventListener('mousemove', resizing)
      window.addEventListener('mouseup', stopResize, true)
    })
  })
}

function resizing(event: MouseEvent) {
  if (!activeResizer) return

  if (activeResizer.classList.contains('resizer-bottom-right')) {
    node.getNodeOptions().style.width = originalWidth + (event.pageX - originalMouseX) + 'px'
    node.getNodeOptions().style.height = originalHeight + (event.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('resizer-bottom-left')) {
    node.getNodeOptions().style.width = originalWidth - (event.pageX - originalMouseX) + 'px'
    node.getNodeOptions().style.height = originalHeight + (event.pageY - originalMouseY) + 'px'
    node.getNodeOptions().position.x = originalX + (event.pageX - originalMouseX)
  } else if (activeResizer.classList.contains('resizer-top-right')) {
    node.getNodeOptions().style.width = originalWidth + (event.pageX - originalMouseX) + 'px'
    node.getNodeOptions().style.height = originalHeight - (event.pageY - originalMouseY) + 'px'
    node.getNodeOptions().position.y = originalY + (event.pageY - originalMouseY)
  } else if (activeResizer.classList.contains('resizer-top-left')) {
    node.getNodeOptions().style.width = originalWidth - (event.pageX - originalMouseX) + 'px'
    node.getNodeOptions().style.height = originalHeight - (event.pageY - originalMouseY) + 'px'
    node.getNodeOptions().position.y = originalY + (event.pageY - originalMouseY)
    node.getNodeOptions().position.x = originalX + (event.pageX - originalMouseX)
  } else if (activeResizer.classList.contains('resizer-top')) {
    node.getNodeOptions().style.height = originalHeight - (event.pageY - originalMouseY) + 'px'
    node.getNodeOptions().position.y = originalY + (event.pageY - originalMouseY)
  } else if (activeResizer.classList.contains('resizer-bottom')) {
    node.getNodeOptions().style.height = originalHeight + (event.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('resizer-left')) {
    node.getNodeOptions().style.width = originalWidth - (event.pageX - originalMouseX) + 'px'
    node.getNodeOptions().position.x = originalX + (event.pageX - originalMouseX)
  } else if (activeResizer.classList.contains('resizer-right')) {
    node.getNodeOptions().style.width = originalWidth + (event.pageX - originalMouseX) + 'px'
  }
}

function stopResize(event: MouseEvent) {
  event.stopPropagation()
  screenRef.value.removeEventListener('mousemove', resizing)
  window.removeEventListener('mouseup', stopResize, true)
  activeResizer = null
}

onMounted(() => {
  nodeResize()
})
</script>
