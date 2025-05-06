import type { Ref } from 'vue'
import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { screenRef } from '@/state'
import { useSelection } from '@/composables/Selection'
import { useNodeAudio } from '@/composables/NodeAudio'
import { activeStyles, passiveStyles } from '@/composables/utils'
import type { TNode, TuseNodeOptions } from '@/types'

export function useNode(data: TuseNodeOptions) {
  const nodeAudio = useNodeAudio()
  const selection = useSelection()
  const nodeElement: Ref<HTMLElement> = ref()
  const options: Ref<TNode> = ref(cloneDeep(data.options))
  let startPosition = { x: 0, y: 0 }
  let shiftPosition = { x: 0, y: 0 }

  function getNodeOptions() {
    return options.value
  }

  function getNodeElement() {
    return nodeElement.value
  }

  function getNodeAudio() {
    return nodeAudio
  }

  function setNodePosition(pageX: number, pageY: number): void {
    options.value.position.x = pageX - shiftPosition.x
    options.value.position.y = pageY - shiftPosition.y
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

  return {
    getNodeElement,
    getNodeOptions,
    getNodeAudio,
    click,
    mouseDown,
    mouseMove,
    mouseUp,
    contextMenu,
    setNodeElement,
  }
}
