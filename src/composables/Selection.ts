import type { Ref } from 'vue'
import { ref } from 'vue'

const nodeSelections: Ref<string[]> = ref([])

export function useSelection() {
  function getNodeSelection() {
    return nodeSelections.value
  }

  function setNodeSelection(id: string) {
    if (!nodeSelections.value.includes(id)) {
      nodeSelections.value.push(id)
    }
  }

  function removeNodeSelectionById(id: string) {
    const index = nodeSelections.value.indexOf(id)
    if (index != -1) {
      nodeSelections.value.splice(index, 1)
    }
  }

  function clearSelections() {
    nodeSelections.value = []
  }

  return {
    getNodeSelection,
    setNodeSelection,
    removeNodeSelectionById,
    clearSelections,
  }
}
