import { ref, shallowRef } from 'vue'
import { useAudio } from '@/composables/Audio'

/**
 * Tek bir medya kaynağının sesini ana miksere bağlar; seviye ölçümü (VU) ve ses düzeyi ayarı sağlar.
 */
export function useNodeAudio() {
  const audio = useAudio()
  const gainNode = shallowRef<GainNode>()
  const volume = ref(0)
  const gainValue = ref(1)
  let sourceNode: MediaStreamAudioSourceNode | MediaElementAudioSourceNode = null
  let analyser: AnalyserNode = null
  let analyserInterval: ReturnType<typeof setInterval> = null

  function getGainNode() {
    return gainNode.value
  }

  function getVolume() {
    return volume.value
  }

  function getGain() {
    return gainValue.value
  }

  function hasAudio() {
    return !!gainNode.value
  }

  function setGain(value: number) {
    gainValue.value = value
    if (gainNode.value) {
      gainNode.value.gain.value = value
    }
  }

  /**
   * Kaynağın sesini miksere bağlar. Ses izi olmayan akışlarda (ör. mikrofonsuz kamera) false döner.
   * Bir medya elemanı için createMediaElementSource sadece bir kez çağrılabilir; tekrar çağrılar yok sayılır.
   */
  function attach(input: HTMLMediaElement | MediaStream) {
    if (gainNode.value) {
      return true
    }

    const context = audio.getAudioContext()
    if (!context) {
      return false
    }

    try {
      if (input instanceof MediaStream) {
        if (!input.getAudioTracks().length) {
          return false
        }

        sourceNode = context.createMediaStreamSource(input)
      } else {
        sourceNode = context.createMediaElementSource(input)
      }
    } catch (error) {
      console.warn('[audio] source could not be connected', error)
      return false
    }

    const gain = context.createGain()
    gain.gain.value = gainValue.value
    analyser = context.createAnalyser()
    analyser.fftSize = 2048

    sourceNode.connect(gain)
    gain.connect(analyser)
    gain.connect(audio.getAudioGain())
    gainNode.value = gain

    return true
  }

  function startAudioAnalyser() {
    destroyAudioAnalyser()
    if (!analyser) {
      return
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyserInterval = setInterval(() => {
      if (!analyser) {
        return
      }

      analyser.getByteTimeDomainData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128
        sum += value * value
      }

      volume.value = Math.round(Math.sqrt(sum / dataArray.length) * 100)
    }, 100)
  }

  function destroyAudioAnalyser() {
    clearInterval(analyserInterval)
    analyserInterval = null
    volume.value = 0
  }

  function destroy() {
    destroyAudioAnalyser()
    sourceNode?.disconnect()
    gainNode.value?.disconnect()
    analyser?.disconnect()
    sourceNode = null
    analyser = null
    gainNode.value = null
  }

  return {
    getGainNode,
    getVolume,
    getGain,
    hasAudio,
    setGain,
    attach,
    startAudioAnalyser,
    destroyAudioAnalyser,
    destroy,
  }
}
