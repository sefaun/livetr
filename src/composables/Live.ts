import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import { canvasRef, channel } from '@/state'
import { channelRTMP } from '@/enums'
import type { TLiveOptions } from '@/types'
const { PassThrough } = window.require('node:stream') as typeof import('node:stream')
const ffmpeg = window.require('fluent-ffmpeg') as typeof import('fluent-ffmpeg')
const ffmpegPath = window.require('ffmpeg-static') as typeof import('ffmpeg-static')

const liveOptions = ref({
  rtmp: channelRTMP[channel.value] ?? '',
  fps: Number(localStorage.getItem(import.meta.env.VITE_STREAM_FPS) ?? 30),
  rtmpKey: localStorage.getItem(import.meta.env.VITE_RTMP_KEY) ?? '',
})

export function useLive() {
  const { t } = useI18n()

  function getLiveOptions() {
    return liveOptions.value
  }

  function setLiveOptions(value: Partial<TLiveOptions>) {
    liveOptions.value = Object.assign({}, liveOptions.value, value)
  }

  function validation() {
    if (!channel.value || !liveOptions.value.rtmp) {
      ElNotification({
        type: 'warning',
        message: t('select_channel'),
      })
      return false
    }

    if (!liveOptions.value.rtmpKey) {
      ElNotification({
        type: 'warning',
        message: t('enter_live_key'),
      })
      return false
    }

    return true
  }

  function startStream() {
    if (!validation()) {
      return
    }

    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string)
    const inputStream = new PassThrough()
    const audioContext = new AudioContext()
    const destination = audioContext.createMediaStreamDestination()

    ffmpeg()
      .input(inputStream)
      .inputFormat('webm')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset ultrafast', // daha az CPU kullanımı
        '-g 60',
        '-b:v 800k', // video bitrate düşürüldü
        '-maxrate 800k',
        '-bufsize 1600k',
        '-b:a 64k', // ses bitrate
        '-r 24', // fps 24 yeterli olabilir
        '-pix_fmt yuv420p',
        '-vf scale=640:360', // çözünürlük 360p yapıldı
      ])
      .format('flv')
      .output(liveOptions.value.rtmp + liveOptions.value.rtmpKey)
      .on('start', (cmd) => console.log('FFmpeg started:', cmd))
      .on('error', (err) => console.error('FFmpeg error:', err))
      .on('end', () => console.log('FFmpeg ended'))
      .run()

    const canvasStream = canvasRef.value.captureStream(liveOptions.value.fps)
    destination.stream.getAudioTracks().forEach((track) => {
      canvasStream.addTrack(track)
    })

    const recorder = new MediaRecorder(canvasStream, {
      mimeType: 'video/webm; codecs=vp8,opus',
    })

    recorder.ondataavailable = async (event) => {
      if (event.data && event.data.size > 0) {
        const buffer = Buffer.from(await event.data.arrayBuffer())
        inputStream.write(buffer)
      }
    }

    recorder.onstop = () => {
      inputStream.end()
    }

    recorder.start(100) // her 100ms'de veri gönder

    ElNotification({
      type: 'success',
      message: t('stream_started'),
    })
  }

  return {
    getLiveOptions,
    startStream,
    setLiveOptions,
  }
}
