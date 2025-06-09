import { screenNodeTypes } from '@/enums'
import { nodes } from '@/state'
import type { TScreenNodeTypes } from '@/types'

export function useNodeOrder() {
  function resetOrder() {
    let backgroundIndex = 0
    Object.values(nodes.value)
      .filter((item) => item.getNodeOptions().type == screenNodeTypes.background)
      .sort((a, b) => Number(a.getNodeOptions().style.zIndex) - Number(b.getNodeOptions().style.zIndex))
      .forEach((item, i) => {
        item.getNodeOptions().style.zIndex = i.toString()
        backgroundIndex = i
      })

    Object.values(nodes.value)
      .sort((a, b) => Number(a.getNodeOptions().style.zIndex) - Number(b.getNodeOptions().style.zIndex))
      .forEach((item, i) => {
        if (item.getNodeOptions().type != screenNodeTypes.background) {
          item.getNodeOptions().style.zIndex = (backgroundIndex + i + 1).toString()
        }
      })
  }

  function getMaxOrderValue() {
    return Math.max(...Object.values(nodes.value).map((item) => Number(item.getNodeOptions().style.zIndex)))
  }

  function getBackgroundMaxOrderValue() {
    const result = Object.values(nodes.value)
      .filter((item) => item.getNodeOptions().type == screenNodeTypes.background)
      .map((item) => Number(item.getNodeOptions().style.zIndex))

    if (result.length) {
      return Math.max(...result)
    }

    return 0
  }

  function getNodeZIndex(type: TScreenNodeTypes) {
    if (type == screenNodeTypes.background) {
      return getBackgroundMaxOrderValue() + 1
    } else {
      return getMaxOrderValue() + 1
    }
  }

  return {
    resetOrder,
    getMaxOrderValue,
    getBackgroundMaxOrderValue,
    getNodeZIndex,
  }
}
