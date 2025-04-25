import type { Ref } from 'vue'
import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { screenRef } from '@/state'
import { useEventEmitter } from '@/composables/EventEmitter'
import { nodeEvents, emitterEvents } from '@/composables/events'
import { activeStyles, passiveStyles } from '@/composables/utils'
import type {
  TNode,
  TNodeEventListenerData,
  TNodeEventMessage,
  TNodeEvents,
  TNodeZIndexMessage,
  TuseNodeOptions,
} from '@/types'
import { screenNodeTypes } from '@/enums'

export function useNode(data: TuseNodeOptions) {
  const EE = useEventEmitter().getEventEmitter()
  const nodeElement: Ref<HTMLElement> = ref()
  const options: Ref<TNode> = ref(cloneDeep(data.options))
  let startPosition = { x: 0, y: 0 }
  let shiftPosition = { x: 0, y: 0 }
  let movePosition = { x: 0, y: 0 }

  function getNodeOptions() {
    return options.value
  }

  function getNodeElement() {
    return nodeElement.value
  }

  function sendZindexMessage() {
    EE.emit(emitterEvents.node.mouseDown, {
      event: 'zIndex',
      data: {
        id: options.value.id,
      },
    })
  }

  function setNodePosition(pageX: number, pageY: number): void {
    movePosition.x = pageX - shiftPosition.x
    movePosition.y = pageY - shiftPosition.y

    //Sol Taraftan Sınırlama
    if (movePosition.x < 0) {
      movePosition.x = 0
    }
    //Yukarı Taraftan Sınırlama
    if (movePosition.y < 0) {
      movePosition.y = 0
    }
    //Sağ Taraftan Sınırlama
    if (
      movePosition.x >
      screenRef.value.getBoundingClientRect().width - nodeElement.value.getBoundingClientRect().width
    ) {
      movePosition.x = screenRef.value.getBoundingClientRect().width - nodeElement.value.getBoundingClientRect().width
    }
    //Aşağı Taraftan Sınırlama
    if (
      movePosition.y >
      screenRef.value.getBoundingClientRect().height - nodeElement.value.getBoundingClientRect().height
    ) {
      movePosition.y = screenRef.value.getBoundingClientRect().height - nodeElement.value.getBoundingClientRect().height
    }

    options.value.position.x = movePosition.x
    options.value.position.y = movePosition.y
  }

  function setStartingPoints(x: number, y: number): void {
    startPosition.x = x
    startPosition.y = y
  }

  function mouseDown(event: MouseEvent) {
    sendZindexMessage()
    activeStyles()

    //Arka plan hep en arkada kalsın diye
    options.value.style.zIndex = options.value.type == screenNodeTypes.background ? '999' : '1001'

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

  function contextMenu(_event: MouseEvent) {
    sendZindexMessage()
    options.value.style.zIndex = '1001'
  }

  function setNodeElement(element: HTMLElement) {
    nodeElement.value = element
  }

  function groundMouseUp() {
    screenRef.value.removeEventListener('mousemove', mouseMove)
  }

  function mouseDownEvent(message: { event: TNodeEvents; data?: TNodeEventListenerData }) {
    switch (message.event) {
      case nodeEvents.zIndex:
        if ((message.data as TNodeEventMessage<TNodeZIndexMessage>).id != options.value.id) {
          options.value.style.zIndex = options.value.type == screenNodeTypes.background ? '999' : '1000'
        }
        break
    }
  }

  function startEmitterListener() {
    EE.on(emitterEvents.screen.groundMouseUp, groundMouseUp)
    EE.on(emitterEvents.node.mouseDown, mouseDownEvent)
  }

  function destroyEmitterListener() {
    EE.removeListener(emitterEvents.screen.groundMouseUp, groundMouseUp)
    EE.removeListener(emitterEvents.node.mouseDown, mouseDownEvent)
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
    mouseDown,
    mouseMove,
    mouseUp,
    contextMenu,
    setNodeElement,
    start,
    destroy,
  }
}
