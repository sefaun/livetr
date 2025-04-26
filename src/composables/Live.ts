import { ref } from 'vue'
import type { Stream } from 'node:stream'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'
import type Ffmpeg from 'fluent-ffmpeg'
import { canvasRef, channel } from '@/state'
import { liveConnectionTypes } from '@/enums'
import type { TLiveConnectionTypes, TLiveOptions } from '@/types'
const { PassThrough } = window.require('node:stream') as typeof import('node:stream')
const ffmpeg = window.require('fluent-ffmpeg') as typeof import('fluent-ffmpeg')
const ffmpegPath = window.require('ffmpeg-static') as typeof import('ffmpeg-static')

// Local değişkenler
const liveStatus = ref<TLiveConnectionTypes>(liveConnectionTypes.connect)
const liveOptions = ref<TLiveOptions>({
  rtmp: '',
  fps: 30,
  rtmpKey: '',
})
// Yayınla ilgili referanslar
let inputStream: Stream.PassThrough
let mediaRecorder: MediaRecorder
let ffmpegProcess: Ffmpeg.FfmpegCommand

export function useLive() {
  const { t } = useI18n()

  function getLiveStatus() {
    return liveStatus.value
  }

  function getLiveOptions() {
    return liveOptions.value
  }

  function setLiveStatus(value: TLiveConnectionTypes) {
    liveStatus.value = value
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

    setLiveStatus(liveConnectionTypes.connecting)
    ffmpeg.setFfmpegPath(ffmpegPath as unknown as string)
    inputStream = new PassThrough()
    const canvasStream = canvasRef.value.captureStream(liveOptions.value.fps)
    mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: 'video/webm; codecs=vp8,opus',
    })

    // ffmpeg başlat
    ffmpegProcess = ffmpeg()
    ffmpegProcess
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
        '-vf scale=640:360',
      ])
      .format('flv')
      .output(liveOptions.value.rtmp + liveOptions.value.rtmpKey)
      .on('start', () => {
        setLiveStatus(liveConnectionTypes.connected)
        ElNotification({
          type: 'success',
          message: t('stream_started'),
        })
      })
      .on('end', () => {
        setLiveStatus(liveConnectionTypes.connect)
        ElNotification({
          type: 'info',
          message: t('stream_ended'),
        })
      })
      .on('error', (err) => {
        setLiveStatus(liveConnectionTypes.connect)
        ElNotification({
          type: 'error',
          message: err.message,
        })
      })

    // MediaRecorder veri geldiğinde inputStream'e yaz
    let ffmpegStarted = false

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data && event.data.size > 0 && inputStream) {
        inputStream.write(Buffer.from(await event.data.arrayBuffer()))

        if (!ffmpegStarted) {
          ffmpegProcess.run()
          ffmpegStarted = true
        }
      }
    }

    mediaRecorder.onstop = () => {
      if (inputStream) {
        inputStream.end()
        inputStream = null
      }
    }

    mediaRecorder.start(100)
  }

  function endStream() {
    setLiveStatus(liveConnectionTypes.connect)

    if (mediaRecorder && mediaRecorder.state != 'inactive') {
      mediaRecorder.stop()
      mediaRecorder = null
    }

    if (inputStream) {
      inputStream.end()
      inputStream = null
    }

    if (ffmpegProcess) {
      try {
        ffmpegProcess.kill('SIGINT')
      } catch (e) {
        console.error('Failed to kill ffmpeg process', e)
      }
      ffmpegProcess = null
    }

    ElNotification({
      type: 'info',
      message: t('stream_ended'),
    })
  }

  return {
    getLiveStatus,
    getLiveOptions,
    setLiveOptions,
    startStream,
    endStream,
  }
}
