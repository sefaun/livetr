import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { canvasRef, nodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import { ctrlOrMetaKey } from '@/composables/utils'
import type { TNode, TTextNodeData } from '@/types'

const ctx = ref<CanvasRenderingContext2D | null>()
const canvasStatus = ref(false)

export function useCanvasRendering() {
  let screenNodes: {
    key: string
    options: TNode
    element: HTMLElement
  }[] = []

  function getCtx() {
    return ctx.value
  }

  function getCanvasStatus() {
    return canvasStatus.value
  }

  function setCtx(value: HTMLCanvasElement) {
    ctx.value = value.getContext('2d')
    clearScreen()
  }

  function setCanvasStatus(value: boolean) {
    canvasStatus.value = value
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
    screenNodes = cloneDeep(
      Object.entries(nodes.value)
        .sort((a, b) => Number(a[1].getNodeOptions().style.zIndex) - Number(b[1].getNodeOptions().style.zIndex))
        .map(([key, value]) => ({ key, options: value.getNodeOptions(), element: value.getNodeElement() }))
    )

    for (const { options, element } of screenNodes) {
      switch (options.type) {
        case screenNodeTypes.text:
          ctx.value.fillText((options.data as TTextNodeData).text || '', options.position.x, options.position.y)
          break

        case screenNodeTypes.image:
        case screenNodeTypes.background:
          ctx.value.drawImage(
            element.querySelector('img'),
            options.position.x,
            options.position.y,
            element.getBoundingClientRect().width,
            element.getBoundingClientRect().height
          )
          break

        case screenNodeTypes.video:
        case screenNodeTypes.sourceMedia:
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

  function canvasPreview() {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (ctrlOrMetaKey(event as any) && event.code == 'KeyP') {
        event.preventDefault()
        setCanvasStatus(!getCanvasStatus())
      }
    })
  }

  return {
    getCanvasStatus,
    getCtx,
    setCtx,
    render,
    canvasPreview,
  }
}
