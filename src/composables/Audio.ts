import { ref } from 'vue'

export function useAudio() {
  const audioContext = ref<AudioContext>()
  const gainNode = ref<GainNode>()
  const analyser = ref<AnalyserNode>()
  const sourceNode = ref<MediaElementAudioSourceNode>()
  const volume = ref(0)
  let analyserInterval: ReturnType<typeof setInterval> = null

  function getAudioContext() {
    return audioContext.value
  }

  function getGainNode() {
    return gainNode.value
  }

  function getAnalyser() {
    return analyser.value
  }

  function getVolume() {
    return volume.value
  }

  function audioConnect(value: HTMLMediaElement) {
    sourceNode.value = audioContext.value.createMediaElementSource(value)
    sourceNode.value.connect(gainNode.value)
    gainNode.value.connect(analyser.value)
  }

  function audioDisconnect() {
    if (sourceNode.value) sourceNode.value.disconnect()
    if (gainNode.value) gainNode.value.disconnect()
    if (analyser.value) analyser.value.disconnect()
  }

  function startAudioAnalyser() {
    let sum = 0
    let val = 0
    let rms = 0

    analyser.value.fftSize = 2048
    const dataArray = new Uint8Array(analyser.value.frequencyBinCount)

    destroyAudioAnalyser()
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

  function destroyAudioAnalyser() {
    clearInterval(analyserInterval)
    analyserInterval = null
  }

  function start() {
    audioContext.value = new AudioContext()
    gainNode.value = audioContext.value.createGain()
    analyser.value = audioContext.value.createAnalyser()
  }

  async function destroy() {
    if (audioContext.value) {
      if (audioContext.value.state != 'closed') {
        await audioContext.value.close()
      }
    }

    destroyAudioAnalyser()
    audioContext.value = null
    gainNode.value = null
    analyser.value = null
  }

  return {
    getAudioContext,
    getGainNode,
    getAnalyser,
    getVolume,
    audioConnect,
    audioDisconnect,
    startAudioAnalyser,
    destroyAudioAnalyser,
    start,
    destroy,
  }
}
