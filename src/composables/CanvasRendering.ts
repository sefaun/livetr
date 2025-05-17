import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { canvasPreviewRef, nodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import { fixPositionHeightForCanvas, fixPositionWidthForCanvas } from '@/composables/utils'
import type { TNode, TTextNodeData } from '@/types'

const ctx = ref<CanvasRenderingContext2D | null>()

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
    ctx.value.font = '24px sans-serif'
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

          ctx.value.font = `${(options.data as TTextNodeData).fontSize}px ${(options.data as TTextNodeData).fontFamily}`
          ctx.value.fillStyle = (options.data as TTextNodeData).color
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
  }

  return {
    getCtx,
    setCtx,
    render,
  }
}
