import { ref } from 'vue'

export function useAudio() {
  const audioContext = ref<AudioContext>()
  const gainNode = ref<GainNode>()
  const audioDestination = ref<MediaStreamAudioDestinationNode>()
  const analyser = ref<AnalyserNode>()
  const sourceNode = ref<MediaElementAudioSourceNode>()
  const volume = ref(0)
  let analyserInterval: NodeJS.Timeout = null

  function getAudioContext() {
    return audioContext.value
  }

  function getAudioDestination() {
    return audioDestination.value
  }

  function getGainNode() {
    return gainNode.value
  }

  function getVolume() {
    return volume.value
  }

  function audioConnect(value: HTMLMediaElement) {
    sourceNode.value = audioContext.value.createMediaElementSource(value)
    sourceNode.value.connect(gainNode.value)
    gainNode.value.connect(analyser.value)
    gainNode.value.connect(audioDestination.value)
  }

  function audioDisconnect() {
    if (sourceNode.value) sourceNode.value.disconnect()
    if (gainNode.value) gainNode.value.disconnect()
    if (analyser.value) analyser.value.disconnect()
  }

  function audioAnalyser() {
    let sum = 0
    let val = 0
    let rms = 0

    analyser.value.fftSize = 256
    const dataArray = new Uint8Array(analyser.value.frequencyBinCount)

    analyserInterval = setInterval(() => {
      analyser.value.getByteTimeDomainData(dataArray)
      sum = 0

      for (let i = 0; i < dataArray.length; i++) {
        val = (dataArray[i] - 128) / 128
        sum += val * val
      }
      rms = Math.sqrt(sum / dataArray.length)
      volume.value = Math.round(rms * 100)
      console.log(volume.value)
    }, 100)
  }

  function start() {
    audioContext.value = new AudioContext()
    gainNode.value = audioContext.value.createGain()
    analyser.value = audioContext.value.createAnalyser()
    audioDestination.value = audioContext.value.createMediaStreamDestination()

    audioAnalyser()
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

    clearInterval(analyserInterval)
    analyserInterval = null
    audioContext.value = null
    gainNode.value = null
    analyser.value = null
    audioDestination.value = null
  }

  return {
    volume,
    getAudioContext,
    getAudioDestination,
    getGainNode,
    getVolume,
    audioConnect,
    audioDisconnect,
    start,
    destroy,
  }
}
