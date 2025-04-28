import type { Ref } from 'vue'
import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { screenRef } from '@/state'
import { useEventEmitter } from '@/composables/EventEmitter'
import { useSelection } from '@/composables/Selection'
import { activeStyles, passiveStyles } from '@/composables/utils'
import { emitterEvents } from '@/enums'
import type { TNode, TuseNodeOptions } from '@/types'

export function useNode(data: TuseNodeOptions) {
  const EE = useEventEmitter().getEventEmitter()
  const selection = useSelection()
  const nodeElement: Ref<HTMLElement> = ref()
  const options: Ref<TNode> = ref(cloneDeep(data.options))
  let startPosition = { x: 0, y: 0 }
  let shiftPosition = { x: 0, y: 0 }
  let currentPosition = { x: 0, y: 0 }

  function getNodeOptions() {
    return options.value
  }

  function getNodeElement() {
    return nodeElement.value
  }

  function setCurrentPosition(x: number = options.value.position.x, y: number = options.value.position.y) {
    currentPosition.x = x
    currentPosition.y = y

    //Sol Taraftan Sınırlama
    if (x < 0) {
      currentPosition.x = 0
    }
    //Yukarı Taraftan Sınırlama
    if (y < 0) {
      currentPosition.y = 0
    }
    //Sağ Taraftan Sınırlama
    if (x > screenRef.value.getBoundingClientRect().width - nodeElement.value.getBoundingClientRect().width) {
      currentPosition.x =
        screenRef.value.getBoundingClientRect().width - nodeElement.value.getBoundingClientRect().width
    }
    //Aşağı Taraftan Sınırlama
    if (y > screenRef.value.getBoundingClientRect().height - nodeElement.value.getBoundingClientRect().height) {
      currentPosition.y =
        screenRef.value.getBoundingClientRect().height - nodeElement.value.getBoundingClientRect().height
    }

    options.value.position.x = currentPosition.x
    options.value.position.y = currentPosition.y
  }

  function setNodePosition(pageX: number, pageY: number): void {
    setCurrentPosition(pageX - shiftPosition.x, pageY - shiftPosition.y)
  }

  function setStartingPoints(x: number, y: number): void {
    startPosition.x = x
    startPosition.y = y
  }

  function select() {
    selection.clear()
    selection.add(options.value.id)
  }

  function click(_event: MouseEvent) {
    select()
  }

  function mouseDown(event: MouseEvent) {
    activeStyles()
    select()

    setStartingPoints(event.clientX, event.clientY)
    shiftPosition.x = startPosition.x - nodeElement.value.getBoundingClientRect().left
    shiftPosition.y = startPosition.y - nodeElement.value.getBoundingClientRect().top
    setNodePosition(
      event.pageX - screenRef.value.getBoundingClientRect().left,
      event.pageY - screenRef.value.getBoundingClientRect().top
    )
    screenRef.value.addEventListener('mousemove', mouseMove)
  }

  function mouseMove(event: MouseEvent) {
    event.preventDefault()
    setNodePosition(
      event.clientX - screenRef.value.getBoundingClientRect().left,
      event.clientY - screenRef.value.getBoundingClientRect().top
    )
  }

  function mouseUp(_event: MouseEvent) {
    passiveStyles()
    screenRef.value.removeEventListener('mousemove', mouseMove)
  }

  function contextMenu(_event: MouseEvent) {}

  function setNodeElement(element: HTMLElement) {
    nodeElement.value = element
  }

  function groundMouseUp() {
    screenRef.value.removeEventListener('mousemove', mouseMove)
  }

  function startEmitterListener() {
    EE.on(emitterEvents.screen.groundMouseUp, groundMouseUp)
  }

  function destroyEmitterListener() {
    EE.removeListener(emitterEvents.screen.groundMouseUp, groundMouseUp)
  }

  function start() {
    startEmitterListener()
  }

  function destroy() {
    destroyEmitterListener()
  }

  return {
    getNodeElement,
    getNodeOptions,
    click,
    mouseDown,
    mouseMove,
    mouseUp,
    contextMenu,
    setNodeElement,
    setCurrentPosition,
    start,
    destroy,
  }
}
