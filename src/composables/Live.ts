import { ref } from 'vue'
import type { Stream } from 'node:stream'
import { useI18n } from 'vue-i18n'
import moment from 'moment'
import { ElNotification } from 'element-plus'
import type { FfmpegCommand } from 'fluent-ffmpeg'
import { useAudio } from '@/composables/Audio'
import { canvasPreviewRef, channel } from '@/state'
import { ffmpegBitrateOptions, liveConnectionTypes, resolutions } from '@/enums'
import type { TLiveConnectionTypes, TLiveOptions } from '@/types'
const { PassThrough } = window.require('node:stream') as typeof import('node:stream')
const ffmpeg = window.require('fluent-ffmpeg') as typeof import('fluent-ffmpeg')
const ffmpegPath = window.require('ffmpeg-static') as typeof import('ffmpeg-static')

let inputStream: Stream.PassThrough
let mediaRecorder: MediaRecorder
let ffmpegProcess: FfmpegCommand
const canvasStream = ref<MediaStream>()
const destination = ref<MediaStreamAudioDestinationNode>()
const liveStatus = ref<TLiveConnectionTypes>(liveConnectionTypes.connect)
const liveOptions = ref<TLiveOptions>({
  rtmp: '',
  fps: 30,
  rtmpKey: '',
  resolution: resolutions['480p'],
})

export function useLive() {
  const { t } = useI18n()
  const audio = useAudio()

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

  function startStream(saveStatus: boolean) {
    if (!validation()) {
      return
    }

    const realFfmpegPath = (ffmpegPath as unknown as string).includes('app.asar')
      ? (ffmpegPath as unknown as string).replace('app.asar', 'app.asar.unpacked')
      : ffmpegPath
    ffmpeg.setFfmpegPath(realFfmpegPath as unknown as string)

    setLiveStatus(liveConnectionTypes.connecting)
    inputStream = new PassThrough()
    canvasStream.value = canvasPreviewRef.value.captureStream(liveOptions.value.fps)
    destination.value = audio.getAudioContext().createMediaStreamDestination()
    const gain = audio.getAudioGain()
    gain.connect(destination.value)

    destination.value.stream.getAudioTracks().forEach((track) => {
      if (track.readyState == 'live') {
        canvasStream.value.addTrack(track)
      }
    })

    // ffmpeg başlat
    ffmpegProcess = ffmpeg()
    startFfmpeg(ffmpegProcess, saveStatus)

    ElNotification({
      type: 'success',
      message: t('stream_started'),
    })

    mediaRecorder = new MediaRecorder(canvasStream.value, {
      mimeType: 'video/webm; codecs=vp8,opus',
    })

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data && event.data.size > 0 && inputStream) {
        inputStream.write(Buffer.from(await event.data.arrayBuffer()))
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
    audio.getAudioGain().disconnect(destination.value)
    if (canvasStream.value && canvasStream.value.getTracks()) {
      canvasStream.value.getTracks().forEach((track) => track.stop())
    }

    canvasStream.value = null
    destination.value = null

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
      } catch (error) {}
      ffmpegProcess = null
    }

    ElNotification({
      type: 'info',
      message: t('stream_ended'),
    })
  }

  function startFfmpeg(ffmpegProcess: FfmpegCommand, saveStatus: boolean) {
    const rtmp = liveOptions.value.rtmp + liveOptions.value.rtmpKey
    const rtmpUrl = saveStatus ? `[f=flv]${rtmp}|[f=mpegts]${moment().format('YYYYMMDD_HHmmss')}.ts` : rtmp
    const outputOptions = [
      '-preset ultrafast',
      '-g 60',
      '-b:a 128k',
      '-pix_fmt yuv420p',
      `-vf scale=${liveOptions.value.resolution}`,
      ...ffmpegBitrateOptions[liveOptions.value.resolution],
      ...(saveStatus ? ['-f tee', '-map 0:v', '-map 0:a', '-flags +global_header'] : ['-f flv']),
    ]

    ffmpegProcess
      .input(inputStream)
      .inputFormat('webm')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(outputOptions)
      .fps(liveOptions.value.fps)
      .output(rtmpUrl)
      .on('start', () => {
        setLiveStatus(liveConnectionTypes.connected)
      })
      .on('end', () => {
        endStream()
      })
      .on('error', (err) => {
        endStream()
        ElNotification({
          type: 'error',
          message: err.message,
        })
      })
      .run()
  }

  return {
    getLiveStatus,
    getLiveOptions,
    setLiveOptions,
    startStream,
    endStream,
  }
}
