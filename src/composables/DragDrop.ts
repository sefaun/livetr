import { cloneDeep } from 'lodash'
import { nodeData } from '@/enums'
import { defaultNodes, studioData } from '@/state'
import type { TScreenNodeTypes } from '@/types'

export function useDragDrop() {
  const item = 'item' as const

  function dragstart(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData(item, (event.currentTarget as HTMLElement).getAttribute('id'))
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
      const nodeId = event.dataTransfer.getData(item) as TScreenNodeTypes

      const nodeContent = defaultNodes.find((node) => node.id == (nodeId as string))
      const node = cloneDeep(nodeData)

      node.id = crypto.randomUUID()
      node.type = nodeContent.type as TScreenNodeTypes
      node.position.x = event.offsetX
      node.position.y = event.offsetY
      node.data = nodeContent.data
      node.style = nodeContent.style

      studioData.value.nodes.push(node)
    }
  }

  return {
    dragstart,
    dragenter,
    dragover,
    dragleave,
    drop,
  }
}
