import { ref } from 'vue'
import { cloneDeep } from 'lodash'
import { nodeData } from '@/enums'
import { studioData } from '@/state'
import type { TScreenNodeTypes, TNode } from '@/types'

const dragNode = ref<TNode>()

export function useDragDrop() {
  const item = 'item' as const

  function nondragdrop(_event: MouseEvent, node: TNode) {
    setDragNode(cloneDeep(node))
    createNode({
      x: 0,
      y: 0,
    })
  }

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
      createNode({
        x: event.offsetX,
        y: event.offsetY,
      })
    }
  }

  function createNode(opts: { x: number; y: number }) {
    const node = cloneDeep(nodeData)
    const nodeContent = getDragNode()

    node.id = window.crypto.randomUUID()
    node.type = nodeContent.type as TScreenNodeTypes
    node.position.x = opts.x
    node.position.y = opts.y
    node.data = nodeContent.data
    node.style = nodeContent.style

    studioData.value.nodes.push(node)
  }

  function getDragNode() {
    return dragNode.value
  }

  function setDragNode(value: TNode) {
    dragNode.value = value
  }

  return {
    nondragdrop,
    dragstart,
    dragenter,
    dragover,
    dragleave,
    drop,
  }
}
