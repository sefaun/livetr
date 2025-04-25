<template>
  <div ref="resizable" class="resizable">
    <!-- <div style="width: 100%; height: 100%">
      <img
        src="https://www.islamveihsan.com/wp-content/uploads/2022/05/resim-ne-demek-187530.jpg"
        class="image-cover"
      />
    </div> -->
    <div class="resizer nw"></div>
    <div class="resizer ne"></div>
    <div class="resizer sw"></div>
    <div class="resizer se"></div>
    <div class="resizer n"></div>
    <div class="resizer s"></div>
    <div class="resizer e"></div>
    <div class="resizer w"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { screenRef } from '@/state'

const resizable = ref<HTMLElement>()

onMounted(() => {
  const resizers = resizable.value.querySelectorAll('.resizer') as NodeListOf<HTMLElement>

  resizers.forEach((resizer) => {
    resizer.addEventListener('mousedown', (event: MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()

      const startX = event.clientX
      const startY = event.clientY
      const startWidth = parseFloat(getComputedStyle(resizable.value).width)
      const startHeight = parseFloat(getComputedStyle(resizable.value).height)
      const startLeft = resizable.value.offsetLeft
      const startTop = resizable.value.offsetTop

      function mouseMoveHandler(event: MouseEvent) {
        event.stopPropagation()
        const dx = event.clientX - startX
        const dy = event.clientY - startY

        if (resizer.classList.contains('e')) {
          resizable.value.style.width = `${startWidth + dx}px`
        }
        if (resizer.classList.contains('s')) {
          resizable.value.style.height = `${startHeight + dy}px`
        }
        if (resizer.classList.contains('w')) {
          resizable.value.style.width = `${startWidth - dx}px`
          resizable.value.style.left = `${startLeft + dx}px`
        }
        if (resizer.classList.contains('n')) {
          resizable.value.style.height = `${startHeight - dy}px`
          resizable.value.style.top = `${startTop + dy}px`
        }

        // Köşeler
        if (resizer.classList.contains('se')) {
          resizable.value.style.width = `${startWidth + dx}px`
          resizable.value.style.height = `${startHeight + dy}px`
        }
        if (resizer.classList.contains('sw')) {
          resizable.value.style.width = `${startWidth - dx}px`
          resizable.value.style.left = `${startLeft + dx}px`
          resizable.value.style.height = `${startHeight + dy}px`
        }
        if (resizer.classList.contains('ne')) {
          resizable.value.style.width = `${startWidth + dx}px`
          resizable.value.style.height = `${startHeight - dy}px`
          resizable.value.style.top = `${startTop + dy}px`
        }
        if (resizer.classList.contains('nw')) {
          resizable.value.style.width = `${startWidth - dx}px`
          resizable.value.style.left = `${startLeft + dx}px`
          resizable.value.style.height = `${startHeight - dy}px`
          resizable.value.style.top = `${startTop + dy}px`
        }
      }

      function mouseUpHandler(event: MouseEvent) {
        event.stopPropagation()
        screenRef.value.removeEventListener('mousemove', mouseMoveHandler)
        screenRef.value.removeEventListener('mouseup', mouseUpHandler)
      }

      screenRef.value.addEventListener('mousemove', mouseMoveHandler)
      screenRef.value.addEventListener('mouseup', mouseUpHandler)
    })
  })
})
</script>

<style scoped>
.resizable {
  position: absolute;
  width: inherit;
  height: inherit;
  top: 0;
  left: 0;
  background: white;
  border: 2px solid #333;
  box-sizing: border-box;
  z-index: 99;
}

.resizer {
  width: 10px;
  height: 10px;
  background: #333;
  position: absolute;
}

/* Köşe tutacakları */
.resizer.nw {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.resizer.ne {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.resizer.sw {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.resizer.se {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

/* Kenar tutacakları */
.resizer.n {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
  width: 100%;
  height: 10px;
}

.resizer.s {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
  width: 100%;
  height: 10px;
}

.resizer.e {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
  height: 100%;
  width: 10px;
}

.resizer.w {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
  height: 100%;
  width: 10px;
}

.image-cover {
  width: 100%;
  height: 100%;
  background-size: contain;
  /* tüm divi kaplar */
  background-position: center;
  /* ortalanır */
  background-repeat: no-repeat;
}
</style>
