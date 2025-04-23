import type { Ref } from 'vue'
import { ref } from 'vue'
import { EventEmitter } from 'events'

const ee: Ref<EventEmitter> = ref()

export function useEventEmitter() {
  function start(): void {
    ee.value = new EventEmitter()
    ee.value.setMaxListeners(1000)
  }

  function getEventEmitter() {
    return ee.value
  }

  return {
    getEventEmitter,
    start,
  }
}
