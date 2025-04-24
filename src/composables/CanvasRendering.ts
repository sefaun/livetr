import { ref } from 'vue'
import { canvasRef, nodes } from '@/state'
import { screenNodeTypes } from '@/enums'
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
      canvasRef.value.getBoundingClientRect().width,
      canvasRef.value.getBoundingClientRect().height
    )
    ctx.value.fillStyle = 'white'
    ctx.value.font = '24px sans-serif'
  }

  function render() {
    requestAnimationFrame(render)
    if (!ctx.value) {
      return
    }

    clearScreen()

    screenNodes = Object.entries(nodes.value)
      .sort((a, b) => Number(a[1].getNodeOptions().style.zIndex) - Number(b[1].getNodeOptions().style.zIndex))
      .map(([key, value]) => ({ key, options: value.getNodeOptions(), element: value.getNodeElement() }))

    for (const { options, element } of screenNodes) {
      switch (options.type) {
        case screenNodeTypes.text:
          ctx.value.fillText((options.data as TTextNodeData).text || '', options.position.x, options.position.y)
          break

        case screenNodeTypes.image:
          ctx.value.drawImage(
            element.querySelector('img'),
            options.position.x,
            options.position.y,
            element.getBoundingClientRect().width,
            element.getBoundingClientRect().height
          )
          break

        case screenNodeTypes.video:
          ctx.value.drawImage(
            element.querySelector('video'),
            options.position.x,
            options.position.y,
            element.getBoundingClientRect().width,
            element.getBoundingClientRect().height
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
