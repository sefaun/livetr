import { ref } from 'vue'

const audioContext = ref<AudioContext>()

export function useAudio() {
  function getAudioContext() {
    return audioContext.value
  }

  function start() {
    audioContext.value = new AudioContext()
  }

  async function destroy() {
    if (audioContext.value) {
      if (audioContext.value.state != 'closed') {
        await audioContext.value.close()
      }
    }

    audioContext.value = null
  }

  return {
    getAudioContext,
    start,
    destroy,
  }
}
