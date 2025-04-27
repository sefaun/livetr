import { ref } from 'vue'

const audioContext = ref<AudioContext>()
const audioDestination = ref<MediaStreamAudioDestinationNode>()
const mediaElementSources = new Map<HTMLMediaElement, MediaElementAudioSourceNode>()

export function useAudio() {
  function getAudioContext() {
    return audioContext.value
  }

  function getAudioDestination() {
    return audioDestination.value
  }

  function audioConnect(value: HTMLMediaElement) {
    if (!mediaElementSources.has(value)) {
      const sourceNode = audioContext.value.createMediaElementSource(value)
      sourceNode.connect(audioDestination.value)
      mediaElementSources.set(value, sourceNode)
    }
  }

  function start() {
    audioContext.value = new AudioContext()
    audioDestination.value = audioContext.value.createMediaStreamDestination()
  }

  async function destroy() {
    if (audioContext.value) {
      if (audioContext.value.state != 'closed') {
        await audioContext.value.close()
      }
    }

    if (audioDestination.value && audioDestination.value.stream) {
      audioDestination.value.stream.getTracks().forEach((track) => track.stop())
    }

    mediaElementSources.forEach((sourceNode) => {
      if (sourceNode) {
        sourceNode.disconnect()
      }
    })

    audioContext.value = null
    audioDestination.value = null
  }

  return {
    getAudioContext,
    getAudioDestination,
    audioConnect,
    start,
    destroy,
  }
}
