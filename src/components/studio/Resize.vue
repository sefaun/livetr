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
import type { PropType } from 'vue'
import { onMounted, defineProps } from 'vue'
import { screenRef } from '@/state'
import type { TNode } from '@/types'

const props = defineProps({
  nodeOptions: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
  nodeRef: {
    type: HTMLElement,
  },
})

let resizers: NodeListOf<HTMLElement>
let originalWidth = 0
let originalHeight = 0
let originalX = 0
let originalY = 0
let originalMouseX = 0
let originalMouseY = 0
let activeResizer: HTMLElement | null = null

function nodeResize() {
  resizers = props.nodeRef.querySelectorAll('.resizer')

  resizers.forEach((resizer) => {
    resizer.addEventListener('mousedown', function (event: MouseEvent) {
      event.stopPropagation()
      event.preventDefault()

      activeResizer = resizer

      originalWidth = props.nodeRef.getBoundingClientRect().width
      originalHeight = props.nodeRef.getBoundingClientRect().height
      originalX = props.nodeOptions.position.x
      originalY = props.nodeOptions.position.y
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
    props.nodeOptions.style.width = originalWidth + (event.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight + (event.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('resizer-bottom-left')) {
    props.nodeOptions.style.width = originalWidth - (event.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight + (event.pageY - originalMouseY) + 'px'
    props.nodeOptions.position.x = originalX + (event.pageX - originalMouseX)
  } else if (activeResizer.classList.contains('resizer-top-right')) {
    props.nodeOptions.style.width = originalWidth + (event.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight - (event.pageY - originalMouseY) + 'px'
    props.nodeOptions.position.y = originalY + (event.pageY - originalMouseY)
  } else if (activeResizer.classList.contains('resizer-top-left')) {
    props.nodeOptions.style.width = originalWidth - (event.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight - (event.pageY - originalMouseY) + 'px'
    props.nodeOptions.position.y = originalY + (event.pageY - originalMouseY)
    props.nodeOptions.position.x = originalX + (event.pageX - originalMouseX)
  } else if (activeResizer.classList.contains('resizer-top')) {
    props.nodeOptions.style.height = originalHeight - (event.pageY - originalMouseY) + 'px'
    props.nodeOptions.position.y = originalY + (event.pageY - originalMouseY)
  } else if (activeResizer.classList.contains('resizer-bottom')) {
    props.nodeOptions.style.height = originalHeight + (event.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('resizer-left')) {
    props.nodeOptions.style.width = originalWidth - (event.pageX - originalMouseX) + 'px'
    props.nodeOptions.position.x = originalX + (event.pageX - originalMouseX)
  } else if (activeResizer.classList.contains('resizer-right')) {
    props.nodeOptions.style.width = originalWidth + (event.pageX - originalMouseX) + 'px'
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
