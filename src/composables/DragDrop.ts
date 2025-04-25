import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { nodeData, screenNodeTypes } from '@/enums'
import { studioData } from '@/state'
import type { TScreenNodeTypes, TNode } from '@/types'

const dragNode = ref<TNode>()

export function useDragDrop() {
  const item = 'item' as const

  function dragstart(event: DragEvent, node: TNode): void {
    if (event.dataTransfer) {
      setDragNode(cloneDeep(node))
      event.dataTransfer.setData(item, '')
    }
  }

  function dragenter(event: DragEvent): void {
    event.preventDefault()
  }

  function dragover(event: DragEvent): void {
    event.preventDefault()
  }

  function dragleave(event: DragEvent): void {
    event.preventDefault()
  }

  function drop(event: DragEvent): void {
    if (event.dataTransfer) {
      const node = cloneDeep(nodeData)
      const nodeContent = getDragNode()

      node.id = window.crypto.randomUUID()
      node.type = nodeContent.type as TScreenNodeTypes
      node.position.x = nodeContent.type == screenNodeTypes.background ? 0 : event.offsetX
      node.position.y = nodeContent.type == screenNodeTypes.background ? 0 : event.offsetY
      node.data = nodeContent.data
      node.style = nodeContent.style

      studioData.value.nodes.push(node)
    }
  }

  function getDragNode() {
    return dragNode.value
  }

  function setDragNode(value: TNode) {
    dragNode.value = value
  }

  return {
    dragstart,
    dragenter,
    dragover,
    dragleave,
    drop,
  }
}
