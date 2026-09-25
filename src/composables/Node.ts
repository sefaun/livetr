import { shallowRef } from 'vue'
import { stageScale } from '@/state'
import { useSelection } from '@/composables/Selection'
import { useNodeAudio } from '@/composables/NodeAudio'
import { useNodeOrder } from '@/composables/NodeOrder'
import { activeStyles, clampToStage, passiveStyles } from '@/composables/utils'
import type { TuseNodeOptions } from '@/types'

/**
 * Sahnedeki bir node'un davranışları (seçme, sürükleme, ses).
 * `options` sahne verisindeki (studioData) nesnenin kendisidir; değişiklikler doğrudan kaydedilen veriye yansır.
 */
export function useNode(data: TuseNodeOptions) {
  const nodeAudio = useNodeAudio()
  const selection = useSelection()
  const nodeOrder = useNodeOrder()
  const nodeElement = shallowRef<HTMLElement>()
  const options = data.options
  let dragStart: { clientX: number; clientY: number; x: number; y: number; width: number; height: number } = null

  function getNodeOptions() {
    return options
  }

  function getNodeElement() {
    return nodeElement.value
  }

  function getNodeAudio() {
    return nodeAudio
  }

  function setNodeElement(element: HTMLElement) {
    nodeElement.value = element
  }

  function select() {
    selection.set([options.id])
  }

  function click(_event: MouseEvent) {
    select()
  }

  function mouseDown(event: MouseEvent) {
    activeStyles()
    select()
    nodeOrder.bringToFront(options)

    dragStart = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: options.position.x,
      y: options.position.y,
      width: nodeElement.value?.offsetWidth ?? 0,
      height: nodeElement.value?.offsetHeight ?? 0,
    }

    // Fare node'un dışına çıkıp bırakılsa bile sürükleme doğru şekilde biter.
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
  }

  function mouseMove(event: MouseEvent) {
    if (!dragStart) {
      return
    }

    event.preventDefault()
    const scale = stageScale.value || 1
    const x = dragStart.x + (event.clientX - dragStart.clientX) / scale
    const y = dragStart.y + (event.clientY - dragStart.clientY) / scale

    const position = clampToStage(x, y, dragStart.width, dragStart.height)
    options.position.x = position.x
    options.position.y = position.y
  }

  function mouseUp(_event?: MouseEvent) {
    passiveStyles()
    dragStart = null
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseup', mouseUp)
  }

  function destroy() {
    if (dragStart) {
      mouseUp()
    }

    nodeAudio.destroy()
  }

  return {
    getNodeElement,
    getNodeOptions,
    getNodeAudio,
    click,
    mouseDown,
    setNodeElement,
    destroy,
  }
}
