import { screenNodeTypes } from '@/enums'
import { activeScene, studioData } from '@/state'
import type { TNode, TScreenNodeTypes } from '@/types'

function sceneNodes() {
  return studioData.value.scene[activeScene.value]?.nodes ?? []
}

function isBackground(node: TNode) {
  return node.type == screenNodeTypes.background
}

export function getZIndex(node: TNode) {
  const value = Number(node.style?.zIndex)
  return Number.isFinite(value) ? value : 0
}

/** Node'ların çizim sırası: arka plan her zaman en altta, diğerleri z-index sırasına göre. */
export function sortNodesByOrder(nodes: TNode[]) {
  return nodes
    .map((node, index) => ({ node, index }))
    .sort(
      (a, b) =>
        Number(!isBackground(a.node)) - Number(!isBackground(b.node)) ||
        getZIndex(a.node) - getZIndex(b.node) ||
        a.index - b.index
    )
    .map(({ node }) => node)
}

export function useNodeOrder() {
  /** Arka plan dışındaki node'ların en yüksek z-index değeri (hiç yoksa 0). */
  function getMaxOrderValue() {
    return Math.max(
      0,
      ...sceneNodes()
        .filter((node) => !isBackground(node))
        .map(getZIndex)
    )
  }

  /** Yeni eklenen node'un z-index değeri: arka plan en altta (0), diğerleri en üstte. */
  function getNodeZIndex(type: TScreenNodeTypes) {
    return type == screenNodeTypes.background ? 0 : getMaxOrderValue() + 1
  }

  /** Seçilen node'u diğerlerinin üstüne taşır. */
  function bringToFront(node: TNode) {
    if (isBackground(node)) {
      return
    }

    const zIndex = getZIndex(node)
    const covered = sceneNodes().some((item) => item.id != node.id && !isBackground(item) && getZIndex(item) >= zIndex)
    if (covered) {
      node.style.zIndex = (getMaxOrderValue() + 1).toString()
    }
  }

  /** z-index değerlerini sırayı bozmadan 1..n aralığına normalize eder. */
  function resetOrder() {
    let order = 1
    for (const node of sortNodesByOrder(sceneNodes())) {
      node.style.zIndex = isBackground(node) ? '0' : (order++).toString()
    }
  }

  return {
    resetOrder,
    getMaxOrderValue,
    getNodeZIndex,
    bringToFront,
  }
}
