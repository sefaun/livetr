import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { canvasPreviewRef, nodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import { fixPositionHeightForCanvas, fixPositionWidthForCanvas } from '@/composables/utils'
import type { TNode, TTextNodeData } from '@/types'
const { ipcRenderer } = require('electron') as typeof import('electron')

const ctx = ref<CanvasRenderingContext2D | null>()
let clampedArray: Uint8ClampedArray
let rgbaBuffer: Uint8ClampedArray
let imageData: ImageData

function convertBGRAtoRGBA(buffer) {
  clampedArray = new Uint8ClampedArray(buffer)
  rgbaBuffer = new Uint8ClampedArray(clampedArray.length)
  for (let i = 0; i < clampedArray.length; i += 4) {
    rgbaBuffer[i] = clampedArray[i + 2] // R
    rgbaBuffer[i + 1] = clampedArray[i + 1] // G
    rgbaBuffer[i + 2] = clampedArray[i] // B
    rgbaBuffer[i + 3] = clampedArray[i + 3] // A
  }
  return rgbaBuffer
}

ipcRenderer.on('frame', (_event, data) => {
  const { width, height, buffer } = data

  imageData = new ImageData(convertBGRAtoRGBA(buffer), width, height)
})

export function useCanvasRendering() {
  let screenNodes: {
    key: string
    options: TNode
    element: HTMLElement
  }[] = []

  function getCtx() {
    return ctx.value
  }

  function setCtx(value: HTMLCanvasElement) {
    ctx.value = value.getContext('2d')
    clearScreen()
  }

  function clearScreen() {
    ctx.value.clearRect(
      0,
      0,
      canvasPreviewRef.value.getBoundingClientRect().width,
      canvasPreviewRef.value.getBoundingClientRect().height
    )
    ctx.value.fillStyle = 'black'
  }

  function render() {
    requestAnimationFrame(render)
    if (!ctx.value) {
      return
    }

    clearScreen()
    screenNodes = cloneDeep(
      Object.entries(nodes.value)
        .sort((a, b) => Number(a[1].getNodeOptions().style.zIndex) - Number(b[1].getNodeOptions().style.zIndex))
        .map(([key, value]) => ({ key, options: value.getNodeOptions(), element: value.getNodeElement() }))
    )

    for (const { options, element } of screenNodes) {
      switch (options.type) {
        case screenNodeTypes.text:
          const lines = (options.data as TTextNodeData).text.split('\n')
          const style = (options.data as TTextNodeData).style

          ctx.value.font = `${fixPositionWidthForCanvas(style.fontSize)}px ${style.fontFamily}`
          ctx.value.fillStyle = style.color
          ctx.value.textAlign = 'left'

          lines.forEach((line) => {
            ctx.value.fillText(
              line,
              fixPositionWidthForCanvas(options.position.x),
              fixPositionHeightForCanvas(options.position.y)
            )
          })
          break

        case screenNodeTypes.image:
        case screenNodeTypes.background:
          ctx.value.drawImage(
            element.querySelector('img'),
            fixPositionWidthForCanvas(options.position.x),
            fixPositionHeightForCanvas(options.position.y),
            fixPositionWidthForCanvas(element.getBoundingClientRect().width),
            fixPositionHeightForCanvas(element.getBoundingClientRect().height)
          )
          break

        case screenNodeTypes.video:
        case screenNodeTypes.sourceMedia:
        case screenNodeTypes.liveCamera:
          ctx.value.drawImage(
            element.querySelector('video'),
            fixPositionWidthForCanvas(options.position.x),
            fixPositionHeightForCanvas(options.position.y),
            fixPositionWidthForCanvas(element.getBoundingClientRect().width),
            fixPositionHeightForCanvas(element.getBoundingClientRect().height)
          )
          break
      }
    }

    if (imageData) {
      ctx.value.putImageData(imageData, 0, 0)
    }
  }

  return {
    getCtx,
    setCtx,
    render,
  }
}
