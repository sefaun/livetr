import { ref } from 'vue'
import { cloneDeep } from 'lodash'

const selections = ref<string[]>([])

export function useSelection() {
  function get() {
    return selections.value
  }

  function set(value: string[]) {
    selections.value = cloneDeep(value)
  }

  function add(value: string) {
    selections.value.push(value)
  }

  function clear() {
    selections.value = []
  }

  return {
    get,
    set,
    add,
    clear,
  }
}
