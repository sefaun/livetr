import { ref } from 'vue'

const audioContext = ref<AudioContext>()
const audioDestination = ref<MediaStreamAudioDestinationNode>()
const audioGain = ref<GainNode>()

export function useAudio() {
  function getAudioContext() {
    return audioContext.value
  }

  function getAudioDestination() {
    return audioDestination.value
  }

  function getAudioGain() {
    return audioGain.value
  }

  function start() {
    audioContext.value = new AudioContext()
    audioDestination.value = audioContext.value.createMediaStreamDestination()
    audioGain.value = audioContext.value.createGain()
  }

  async function destroy() {
    if (audioContext.value) {
      if (audioContext.value.state != 'closed') {
        await audioContext.value.close()
      }
    }

    audioDestination.value.disconnect()
    audioGain.value.disconnect()

    audioContext.value = null
    audioDestination.value = null
    audioGain.value = null
  }

  return {
    getAudioContext,
    getAudioDestination,
    getAudioGain,
    start,
    destroy,
  }
}
