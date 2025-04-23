<template>
  <div class="resizable" id="resizable">
    <div style="width: 100%; height: 100%">
      <img
        src="https://www.islamveihsan.com/wp-content/uploads/2022/05/resim-ne-demek-187530.jpg"
        class="image-cover"
      />
    </div>
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
const resizable = document.getElementById('resizable')
const resizers = resizable.querySelectorAll('.resizer') as NodeListOf<HTMLElement>

resizers.forEach((resizer) => {
  resizer.addEventListener('mousedown', (event: MouseEvent) => {
    event.preventDefault()

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = parseFloat(getComputedStyle(resizable).width)
    const startHeight = parseFloat(getComputedStyle(resizable).height)
    const startLeft = resizable.offsetLeft
    const startTop = resizable.offsetTop

    function mouseMoveHandler(event: MouseEvent) {
      const dx = event.clientX - startX
      const dy = event.clientY - startY

      if (resizer.classList.contains('e')) {
        resizable.style.width = `${startWidth + dx}px`
      }
      if (resizer.classList.contains('s')) {
        resizable.style.height = `${startHeight + dy}px`
      }
      if (resizer.classList.contains('w')) {
        resizable.style.width = `${startWidth - dx}px`
        resizable.style.left = `${startLeft + dx}px`
      }
      if (resizer.classList.contains('n')) {
        resizable.style.height = `${startHeight - dy}px`
        resizable.style.top = `${startTop + dy}px`
      }

      // Köşeler
      if (resizer.classList.contains('se')) {
        resizable.style.width = `${startWidth + dx}px`
        resizable.style.height = `${startHeight + dy}px`
      }
      if (resizer.classList.contains('sw')) {
        resizable.style.width = `${startWidth - dx}px`
        resizable.style.left = `${startLeft + dx}px`
        resizable.style.height = `${startHeight + dy}px`
      }
      if (resizer.classList.contains('ne')) {
        resizable.style.width = `${startWidth + dx}px`
        resizable.style.height = `${startHeight - dy}px`
        resizable.style.top = `${startTop + dy}px`
      }
      if (resizer.classList.contains('nw')) {
        resizable.style.width = `${startWidth - dx}px`
        resizable.style.left = `${startLeft + dx}px`
        resizable.style.height = `${startHeight - dy}px`
        resizable.style.top = `${startTop + dy}px`
      }
    }

    function mouseUpHandler() {
      window.removeEventListener('mousemove', mouseMoveHandler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }

    window.addEventListener('mousemove', mouseMoveHandler)
    window.addEventListener('mouseup', mouseUpHandler)
  })
})
</script>

<style scoped>
.resizable {
  position: absolute;
  width: 300px;
  height: 200px;
  background: white;
  border: 2px solid #333;
  box-sizing: border-box;
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
  background-size: contain; /* tüm divi kaplar */
  background-position: center; /* ortalanır */
  background-repeat: no-repeat;
}
</style>
