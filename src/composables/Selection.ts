import { ref } from 'vue'

const selections = ref<string[]>([])

export function useSelection() {
  function get() {
    return selections.value
  }

  function set(value: string[]) {
    selections.value = [...value]
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
