import type { Ref } from 'vue'
import { ref } from 'vue'

export function useState(value?: any) {
  const state: Ref<any> = ref(value)

  function get(): any {
    return state.value
  }

  function set(value: any): void {
    state.value = value
  }

  return {
    get,
    set,
  }
}
