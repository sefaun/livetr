import { ref } from 'vue'
import { useNodeOrder } from '@/composables/NodeOrder'
import { useSelection } from '@/composables/Selection'
import { clientToStage, clone } from '@/composables/utils'
import { nodeData } from '@/enums'
import { activeScene, studioData } from '@/state'
import type { TNode } from '@/types'

const dragNode = ref<TNode>()

export function useDragDrop() {
  const nodeOrder = useNodeOrder()
  const selection = useSelection()
  const item = 'item' as const
  const nodeItem = 'nodeItem' as const

  /** Sürüklemeden (tıklayarak) sahneye ekler; arka plan gibi tam ekran öğeler için. */
  function nondragdrop(_event: MouseEvent, node: TNode) {
    setDragNode(clone(node))
    createNode({
      x: 0,
      y: 0,
    })
  }

  function dragstart(event: DragEvent, node: TNode): void {
    if (event.dataTransfer) {
      setDragNode(clone(node))
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData(item, nodeItem)
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
    if (event.dataTransfer?.getData(item) != nodeItem) {
      return
    }

    // offsetX/Y bırakılan elemana (ör. başka bir node) göre hesaplanır; sahneye göre konum kullanılır.
    createNode(clientToStage(event.clientX, event.clientY))
  }

  function createNode(opts: { x: number; y: number }) {
    const nodeContent = getDragNode()
    const scene = studioData.value.scene[activeScene.value]
    if (!nodeContent || !scene) {
      return
    }

    const node = clone(nodeData)
    node.id = window.crypto.randomUUID()
    node.type = nodeContent.type
    node.position.x = Math.round(opts.x)
    node.position.y = Math.round(opts.y)
    node.data = nodeContent.data
    node.style = {
      ...nodeContent.style,
      zIndex: nodeOrder.getNodeZIndex(nodeContent.type).toString(),
    }

    scene.nodes.push(node)
    selection.set([node.id])
    setDragNode(null)
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
