<template>
  <div @mousedown.stop class="resizer top-left"></div>
  <div @mousedown.stop class="resizer top"></div>
  <div @mousedown.stop class="resizer top-right"></div>
  <div @mousedown.stop class="resizer right"></div>
  <div @mousedown.stop class="resizer bottom-right"></div>
  <div @mousedown.stop class="resizer bottom"></div>
  <div @mousedown.stop class="resizer bottom-left"></div>
  <div @mousedown.stop class="resizer left"></div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { onMounted, defineProps, nextTick } from 'vue'
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

let resizable: HTMLElement = props.nodeRef

onMounted(() => {
  nextTick(() => {
    resizable = props.nodeRef
    globalresize()
  })
})

let resizers: NodeListOf<HTMLElement>
let originalWidth = 0
let originalHeight = 0
let originalX = 0
let originalY = 0
let originalMouseX = 0
let originalMouseY = 0
let activeResizer: HTMLElement | null = null

function globalresize() {
  resizers = props.nodeRef.querySelectorAll('.resizer')

  resizers.forEach((resizer) => {
    resizer.addEventListener('mousedown', function (e) {
      e.preventDefault()

      activeResizer = resizer

      originalWidth = parseFloat(getComputedStyle(resizable, null).getPropertyValue('width').replace('px', ''))
      originalHeight = parseFloat(getComputedStyle(resizable, null).getPropertyValue('height').replace('px', ''))
      originalX = resizable.getBoundingClientRect().left
      originalY = resizable.getBoundingClientRect().top
      originalMouseX = e.pageX
      originalMouseY = e.pageY

      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    })
  })
}

function resize(e: MouseEvent) {
  if (!activeResizer) return

  if (activeResizer.classList.contains('bottom-right')) {
    props.nodeOptions.style.width = originalWidth + (e.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight + (e.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('bottom-left')) {
    props.nodeOptions.style.width = originalWidth - (e.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight + (e.pageY - originalMouseY) + 'px'
    props.nodeOptions.style.left = originalX + (e.pageX - originalMouseX) + 'px'
  } else if (activeResizer.classList.contains('top-right')) {
    props.nodeOptions.style.width = originalWidth + (e.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight - (e.pageY - originalMouseY) + 'px'
    props.nodeOptions.style.top = originalY + (e.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('top-left')) {
    props.nodeOptions.style.width = originalWidth - (e.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.height = originalHeight - (e.pageY - originalMouseY) + 'px'
    props.nodeOptions.style.top = originalY + (e.pageY - originalMouseY) + 'px'
    props.nodeOptions.style.left = originalX + (e.pageX - originalMouseX) + 'px'
  } else if (activeResizer.classList.contains('top')) {
    props.nodeOptions.style.height = originalHeight - (e.pageY - originalMouseY) + 'px'
    props.nodeOptions.style.top = originalY + (e.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('bottom')) {
    props.nodeOptions.style.height = originalHeight + (e.pageY - originalMouseY) + 'px'
  } else if (activeResizer.classList.contains('left')) {
    props.nodeOptions.style.width = originalWidth - (e.pageX - originalMouseX) + 'px'
    props.nodeOptions.style.left = originalX + (e.pageX - originalMouseX) + 'px'
  } else if (activeResizer.classList.contains('right')) {
    props.nodeOptions.style.width = originalWidth + (e.pageX - originalMouseX) + 'px'
  }
}

function stopResize(e: MouseEvent) {
  e.stopPropagation()
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
  activeResizer = null
}
</script>

<style scoped>
.resizer {
  width: 10px;
  height: 10px;
  background: #333;
  position: absolute;
  z-index: 2;
  cursor: pointer;
}

/* Köşe tutacakları */
.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}
.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}
.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}
.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

/* Kenar ortası tutacakları */
.top {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}
.bottom {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}
.left {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
.right {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
</style>
