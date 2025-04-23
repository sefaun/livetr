import type { Ref } from 'vue'
import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { screenRef, nodes } from '@/state'
import { useEventEmitter } from '@/composables/EventEmitter'
import { nodeEvents, emitterEvents } from '@/composables/events'
import { useSelection } from '@/composables/Selection'
import { ctrlOrMetaKey, activeStyles, passiveStyles } from '@/composables/utils'
import type {
  TNode,
  TNodeEventListenerData,
  TNodeEventMessage,
  TNodeEvents,
  TNodeZIndexMessage,
  TuseNodeOptions,
} from '@/types'

export function useNode(data: TuseNodeOptions) {
  const EE = useEventEmitter().getEventEmitter()
  const selection = useSelection()
  const nodeElement: Ref<HTMLDivElement> = ref()
  const options: Ref<TNode> = ref(cloneDeep(data.options))
  let nodeMoveStatus = false

  function getNodeOptions() {
    return options.value
  }

  function getNodeElement() {
    return nodeElement.value
  }

  function getNodeMoveStatus() {
    return nodeMoveStatus
  }

  function setNodeMoveStatus(value: boolean) {
    nodeMoveStatus = value
  }

  function sendZindexMessage() {
    EE.emit(emitterEvents.node.mouseDown, {
      event: 'zIndex',
      data: {
        id: options.value.id,
      },
    })
  }

  function controlNodes(event: MouseEvent) {
    for (const id of selection.getNodeSelection().length > 1 ? selection.getNodeSelection() : [options.value.id]) {
      nodes.value[id].nodeMove(event.movementX, event.movementY)
    }
  }

  function selectionOperations(event: MouseEvent) {
    if (ctrlOrMetaKey(event)) {
      if (!selection.getNodeSelection().includes(options.value.id)) {
        selection.setNodeSelection(options.value.id)
      } else {
        selection.removeNodeSelectionById(options.value.id)
      }
      return
    }

    if (!ctrlOrMetaKey(event) && !getNodeMoveStatus()) {
      selection.clearSelections()
      selection.setNodeSelection(options.value.id)
      return
    }

    if (ctrlOrMetaKey(event) && !getNodeMoveStatus()) {
      if (!selection.getNodeSelection().includes(options.value.id)) {
        selection.setNodeSelection(options.value.id)
      } else {
        selection.removeNodeSelectionById(options.value.id)
      }
      return
    }
  }

  function mouseDown(_event: MouseEvent) {
    sendZindexMessage()
    activeStyles()
    options.value.style.zIndex = '1001'
    screenRef.value.addEventListener('mousemove', mouseMove)
  }

  function mouseMove(event: MouseEvent) {
    event.preventDefault()
    setNodeMoveStatus(true)
    controlNodes(event)
  }

  function mouseUp(event: MouseEvent) {
    passiveStyles()
    selectionOperations(event)
    setNodeMoveStatus(false)
    screenRef.value.removeEventListener('mousemove', mouseMove)
  }

  function contextMenu(_event: MouseEvent) {
    sendZindexMessage()
    options.value.style.zIndex = '1001'
  }

  function nodeMove(x: number, y: number) {
    options.value.position.x = x + options.value.position.x
    options.value.position.y = y + options.value.position.y
  }

  function setNodeElement(element: HTMLDivElement) {
    nodeElement.value = element
  }

  function groundMouseUp() {
    screenRef.value.removeEventListener('mousemove', mouseMove)
  }

  function mouseDownEvent(message: { event: TNodeEvents; data?: TNodeEventListenerData }) {
    switch (message.event) {
      case nodeEvents.zIndex:
        if ((message.data as TNodeEventMessage<TNodeZIndexMessage>).id != options.value.id) {
          options.value.style.zIndex = '1000'
        }
        break

      default:
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
    nodeMove,
    setNodeElement,
    start,
    destroy,
  }
}
