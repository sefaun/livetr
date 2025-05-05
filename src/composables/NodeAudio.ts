import { ref } from 'vue'
import { useAudio } from '@/composables/Audio'

export function useNodeAudio() {
  const gainNode = ref<GainNode>()
  const analyser = ref<AnalyserNode>()
  const sourceNode = ref<MediaStreamAudioSourceNode>()
  const volume = ref(0)
  const audio = useAudio()
  const audioContext = audio.getAudioContext()
  let analyserInterval: ReturnType<typeof setInterval> = null

  function getGainNode() {
    return gainNode.value
  }

  function getAnalyser() {
    return analyser.value
  }

  function getVolume() {
    return volume.value
  }

  function createAudioStream(value: MediaStream) {
    sourceNode.value = audioContext.createMediaStreamSource(value)
    audioConnect()
  }

  function audioConnect() {
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
    }, 100)
  }

  function destroyAudioAnalyser() {
    clearInterval(analyserInterval)
    analyserInterval = null
  }

  function start() {
    gainNode.value = audioContext.createGain()
    analyser.value = audioContext.createAnalyser()
  }

  function destroy() {
    audioDisconnect()
    destroyAudioAnalyser()
    gainNode.value = null
    analyser.value = null
  }

  return {
    getGainNode,
    getAnalyser,
    getVolume,
    audioConnect,
    audioDisconnect,
    createAudioStream,
    startAudioAnalyser,
    destroyAudioAnalyser,
    start,
    destroy,
  }
}
