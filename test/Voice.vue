<template>
  <div>
    <div class="video-block" v-for="(src, index) in videoSources" :key="index">
      <video :ref="(el) => (videoRefs[index] = el)" :src="src" controls width="400"></video>
      <div class="volume-bar-container">
        <div class="volume-bar" :style="{ width: levels[index] + '%' }"></div>
      </div>
    </div>

    <audio ref="combinedAudio" controls></audio>
    <button @click="combineAudio">Sesleri Birleştir</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import video1 from '@/assets/bigbuckbunny.mp4'
import video2 from '@/assets/bigbuckbunny.mp4'

const videoSources = [video1, video2]

const videoRefs = ref([])
const combinedAudio = ref(null)
const levels = reactive(Array(videoSources.length).fill(0))

const combineAudio = async () => {
  const ctx = new AudioContext()
  const destination = ctx.createMediaStreamDestination()
  const outputGain = ctx.createGain()
  outputGain.gain.value = 1.0

  videoRefs.value.forEach(async (videoEl, index) => {
    if (!(videoEl instanceof HTMLVideoElement)) return

    const source = ctx.createMediaElementSource(videoEl)
    const gainNode = ctx.createGain()
    gainNode.gain.value = 1.0
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    source.connect(gainNode)
    gainNode.connect(analyser)
    gainNode.connect(outputGain)

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray)
      const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
      levels[index] = Math.min((avg / 256) * 100, 100)
      requestAnimationFrame(updateLevel)
    }
    updateLevel()

    try {
      await videoEl.play()
    } catch (e) {
      console.warn('Video play failed:', e)
    }
  })

  outputGain.connect(destination)

  try {
    combinedAudio.value.srcObject = destination.stream
    await combinedAudio.value.play()
  } catch (e) {
    console.warn('Combined audio play failed:', e)
  }
}
</script>

<style scoped>
.video-block {
  margin-bottom: 20px;
}
.volume-bar-container {
  width: 100%;
  height: 10px;
  background-color: #ccc;
  margin-top: 4px;
  border-radius: 4px;
}
.volume-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.1s linear;
  border-radius: 4px;
}
</style>
