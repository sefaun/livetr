import { shallowRef } from 'vue'

const audioContext = shallowRef<AudioContext>()
const audioGain = shallowRef<GainNode>()

/**
 * Stüdyonun ses mikseri. Sahnedeki her ses kaynağı (video, kamera mikrofonu, ekran sesi, arka plan müziği)
 * kendi gain node'u üzerinden bu ana gain'e bağlanır. Yayın ve önizleme, ana gain'e bağlanan
 * MediaStreamAudioDestinationNode ile sesi alır.
 */
export function useAudio() {
  function getAudioContext() {
    return audioContext.value
  }

  function getAudioGain() {
    return audioGain.value
  }

  function start() {
    if (audioContext.value) {
      return
    }

    // Opus ve AAC 48 kHz ile çalışır; yeniden örnekleme ihtiyacı ortadan kalkar.
    const context = new AudioContext({ sampleRate: 48000 })
    audioGain.value = context.createGain()
    audioContext.value = context
  }

  /** Tarayıcı, kullanıcı etkileşimi olmadan başlatılan AudioContext'i askıya alabilir. */
  async function resume() {
    if (audioContext.value?.state == 'suspended') {
      await audioContext.value.resume()
    }
  }

  /** Ana ses miksini bir MediaStream olarak verir (yayın ve önizleme için). */
  function createStreamDestination() {
    const destination = audioContext.value.createMediaStreamDestination()
    audioGain.value.connect(destination)
    return destination
  }

  function releaseStreamDestination(destination: MediaStreamAudioDestinationNode) {
    if (!destination) {
      return
    }

    destination.stream.getTracks().forEach((track) => track.stop())
    try {
      audioGain.value?.disconnect(destination)
    } catch (_error) {}
  }

  async function destroy() {
    const context = audioContext.value
    audioGain.value?.disconnect()
    audioContext.value = null
    audioGain.value = null

    if (context && context.state != 'closed') {
      await context.close()
    }
  }

  return {
    getAudioContext,
    getAudioGain,
    start,
    resume,
    createStreamDestination,
    releaseStreamDestination,
    destroy,
  }
}
