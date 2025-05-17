import { ref } from 'vue'

const screenChangeStatus = ref(false)
const storeChanges: Record<string, Function> = {}

export function useScreenChange() {
  function getScreenChangeStatus() {
    return screenChangeStatus.value
  }

  function setScreenChangeStatus(value: boolean) {
    screenChangeStatus.value = value
  }

  function saveChanges() {
    Object.values(storeChanges).forEach((callback) => callback())
  }

  function onSaveChanges(callback: () => void) {
    const uuid = window.crypto.randomUUID()
    storeChanges[uuid] = callback
    return uuid
  }

  function removeChangeCallback(uuid: string) {
    delete storeChanges[uuid]
  }

  return {
    onSaveChanges,
    getScreenChangeStatus,
    setScreenChangeStatus,
    removeChangeCallback,
    saveChanges,
  }
}
