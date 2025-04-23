import { cloneDeep } from 'lodash'
import { nodeData } from '@/enums'
import { studioData } from '@/state'
import type { TScreenNodeTypes } from '@/types'

export function useDragDrop() {
  function dragstart(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('item', (event.target as HTMLElement).getAttribute('type'))
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
      const item = event.dataTransfer.getData('item') as TScreenNodeTypes
      const node = cloneDeep(nodeData)

      node.id = crypto.randomUUID()
      node.type = item as TScreenNodeTypes
      node.position.x = event.offsetX
      node.position.y = event.offsetY

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
