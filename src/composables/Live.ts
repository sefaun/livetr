import { ref, shallowRef } from 'vue'
import i18n from '@/locales/i18n'
import { platform } from '@/platform'
import { useAudio } from '@/composables/Audio'
import { notify } from '@/composables/Notify'
import { errorMessage, isValidServerUrl, joinStreamUrl, parseResolution } from '@/composables/utils'
import { canvasPreviewRef, channel } from '@/state'
import { readSetting, writeSetting } from '@/settings'
import {
  audioBitrate,
  channelRTMP,
  channels,
  fps,
  liveConnectionTypes,
  recorderMimeTypes,
  resolutions,
  videoBitrates,
} from '@/enums'
import type { TChannels, TFps, TLiveConnectionTypes, TLiveOptions, TLiveResolution } from '@/types'
import type { TStreamEvent, TStreamStats } from '@/platform/types'

/** MediaRecorder'ın ffmpeg'e veri gönderme aralığı (ms). Küçük değer = düşük gecikme. */
const RECORDER_TIMESLICE_MS = 100
/** Ara kodlama (WebM) ffmpeg'de tekrar kodlanır; kalite kaybı olmaması için yayın bitrate'inden yüksek tutulur. */
const INTERMEDIATE_BITRATE_FACTOR = 2.5
const INTERMEDIATE_AUDIO_BITRATE = 192000
const RECORDER_STOP_TIMEOUT_MS = 3000

type TSession = {
  stream: MediaStream
  destination: MediaStreamAudioDestinationNode
  recorder: MediaRecorder
  /** WebM parçaları sırayla gönderilir; Blob -> ArrayBuffer dönüşümü sırayı bozmamalı. */
  queue: Promise<void>
  sending: boolean
}

const { t } = i18n.global
const liveStatus = ref<TLiveConnectionTypes>(liveConnectionTypes.connect)
const liveStats = shallowRef<TStreamStats>(null)
const liveOptions = ref<TLiveOptions>({
  rtmp: '',
  fps: 30,
  rtmpKey: '',
  resolution: resolutions['480p'],
  record: false,
})
let session: TSession = null
let unsubscribe: () => void = null

/**
 * Canlı yayın akışı:
 *   canvas (sahne) + ses mikseri -> MediaRecorder (WebM) -> [IPC] -> ana süreçte ffmpeg -> RTMP (Twitch/YouTube/özel)
 */
export function useLive() {
  const audio = useAudio()

  function getLiveStatus() {
    return liveStatus.value
  }

  function getLiveStats() {
    return liveStats.value
  }

  function getLiveOptions() {
    return liveOptions.value
  }

  function setLiveStatus(value: TLiveConnectionTypes) {
    liveStatus.value = value
  }

  function setLiveOptions(value: Partial<TLiveOptions>) {
    liveOptions.value = { ...liveOptions.value, ...value }

    if (value.rtmp !== undefined) writeSetting('rtmpUrl', value.rtmp)
    if (value.rtmpKey !== undefined) writeSetting('rtmpKey', value.rtmpKey)
    if (value.fps !== undefined) writeSetting('fps', value.fps.toString())
    if (value.resolution !== undefined) writeSetting('resolution', value.resolution)
    if (value.record !== undefined) writeSetting('record', String(value.record))
  }

  function setChannel(value: TChannels) {
    channel.value = value
    writeSetting('channel', value)
  }

  /** Kayıtlı yayın ayarlarını yükler (önceki sürümlerin ayarlarıyla uyumlu). */
  function loadLiveOptions() {
    const storedChannel = readSetting('channel') as TChannels
    const storedFps = Number(readSetting('fps')) as TFps
    const storedResolution = readSetting('resolution') as TLiveResolution
    const storedUrl = readSetting('rtmpUrl') ?? ''

    channel.value = Object.values(channels).includes(storedChannel) ? storedChannel : undefined
    liveOptions.value = {
      // Eski sürümler seçilen platformun adresini de bu alana yazıyordu; özel sunucu adresi olarak kullanılmaz.
      rtmp: Object.values(channelRTMP).some((url) => url && url == storedUrl) ? '' : storedUrl,
      rtmpKey: readSetting('rtmpKey') ?? '',
      fps: fps.includes(storedFps) ? storedFps : fps[0],
      resolution: Object.values(resolutions).includes(storedResolution) ? storedResolution : resolutions['480p'],
      record: readSetting('record') == 'true',
    }
  }

  function getServerUrl() {
    if (!channel.value) {
      return ''
    }

    return channel.value == channels.custom ? liveOptions.value.rtmp : channelRTMP[channel.value]
  }

  function validation() {
    const serverUrl = getServerUrl()

    if (!channel.value || !serverUrl.trim()) {
      notify('warning', t('select_channel'))
      return false
    }

    if (!isValidServerUrl(serverUrl)) {
      notify('warning', t('invalid_rtmp_url'))
      return false
    }

    if (!liveOptions.value.rtmpKey.trim()) {
      notify('warning', t('enter_live_key'))
      return false
    }

    return true
  }

  function pickMimeType() {
    return recorderMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
  }

  function subscribe() {
    if (!unsubscribe && platform.stream) {
      unsubscribe = platform.stream.onEvent(onStreamEvent)
    }
  }

  function onStreamEvent(event: TStreamEvent) {
    switch (event.type) {
      case 'state':
        if (event.state == 'live' && liveStatus.value == liveConnectionTypes.connecting) {
          setLiveStatus(liveConnectionTypes.connected)
          notify('success', t('stream_started'))
        } else if (event.state == 'stopping' && session) {
          setLiveStatus(liveConnectionTypes.disconnecting)
        }
        break

      case 'stats':
        liveStats.value = event.stats
        break

      case 'warning':
        notify(event.code == 'congested' ? 'warning' : 'success', t(`stream_${event.code}`), {
          duration: event.code == 'congested' ? 10000 : 4500,
        })
        break

      case 'ended':
        releaseSession()
        setLiveStatus(liveConnectionTypes.connect)
        liveStats.value = null

        if (event.reason == 'error') {
          if (event.details) {
            console.error('[stream] ffmpeg output:\n' + event.details)
          }
          notify('error', event.message || t('stream_error'), { title: t('stream_error'), duration: 0 })
        } else {
          notify('info', t('stream_ended'))
        }

        if (event.recordPath) {
          notify('success', event.recordPath, { title: t('recording_saved'), duration: 10000 })
        }
        break
    }
  }

  function enqueueChunk(current: TSession, blob: Blob) {
    if (!blob?.size) {
      return
    }

    current.queue = current.queue
      .then(async () => {
        if (!current.sending) {
          return
        }

        const buffer = await blob.arrayBuffer()
        if (current.sending) {
          platform.stream.write(buffer)
        }
      })
      .catch((error) => console.error('[stream] chunk could not be sent', error))
  }

  /** Yayın kaynaklarını (kayıt, canvas yakalama, ses bağlantısı) serbest bırakır. */
  function releaseSession() {
    const current = session
    if (!current) {
      return
    }

    session = null
    current.sending = false

    if (current.recorder && current.recorder.state != 'inactive') {
      current.recorder.ondataavailable = null
      try {
        current.recorder.stop()
      } catch (_error) {}
    }

    current.stream.getTracks().forEach((track) => track.stop())
    audio.releaseStreamDestination(current.destination)
  }

  function stopRecorder(recorder: MediaRecorder) {
    if (!recorder || recorder.state == 'inactive') {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      // stop(), bekleyen son veriyi 'dataavailable' ile verdikten sonra 'stop' olayını tetikler.
      recorder.addEventListener('stop', () => resolve(), { once: true })
      setTimeout(resolve, RECORDER_STOP_TIMEOUT_MS)
      recorder.stop()
    })
  }

  async function startStream() {
    if (liveStatus.value != liveConnectionTypes.connect) {
      return
    }

    if (!platform.stream) {
      notify('warning', t('desktop_only'))
      return
    }

    const canvas = canvasPreviewRef.value
    if (!validation() || !canvas) {
      return
    }

    subscribe()
    setLiveStatus(liveConnectionTypes.connecting)
    liveStats.value = null

    const options = liveOptions.value
    const { width, height } = parseResolution(options.resolution)
    const videoBitrate = videoBitrates[options.resolution]

    try {
      await audio.resume()

      const stream = canvas.captureStream(options.fps)
      const destination = audio.createStreamDestination()
      destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track))
      session = { stream, destination, recorder: null, queue: Promise.resolve(), sending: true }

      await platform.stream.start({
        url: joinStreamUrl(getServerUrl(), options.rtmpKey),
        width,
        height,
        fps: options.fps,
        videoBitrate,
        audioBitrate,
        record: options.record,
      })

      // Başlatma sırasında yayın durdurulduysa ya da ffmpeg kapandıysa kayda başlanmaz.
      const current = session
      if (!current || getLiveStatus() == liveConnectionTypes.disconnecting) {
        return
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: pickMimeType(),
        videoBitsPerSecond: Math.round(videoBitrate * 1000 * INTERMEDIATE_BITRATE_FACTOR),
        audioBitsPerSecond: INTERMEDIATE_AUDIO_BITRATE,
      })

      recorder.ondataavailable = (event) => enqueueChunk(current, event.data)
      recorder.onerror = (event: Event) => {
        const error = (event as ErrorEvent).error ?? event
        console.error('[stream] MediaRecorder error', error)
        notify('error', errorMessage(error), { title: t('stream_error'), duration: 0 })
        endStream()
      }

      current.recorder = recorder
      recorder.start(RECORDER_TIMESLICE_MS)
    } catch (error) {
      releaseSession()
      setLiveStatus(liveConnectionTypes.connect)
      notify('error', errorMessage(error), { title: t('stream_error'), duration: 0 })
    }
  }

  /**
   * Yayını düzgün şekilde bitirir: son kareler gönderilir, ffmpeg kodlamayı tamamlayıp bağlantıyı kapatır.
   */
  async function endStream() {
    const current = session
    if (!current || liveStatus.value == liveConnectionTypes.disconnecting) {
      return
    }

    setLiveStatus(liveConnectionTypes.disconnecting)

    try {
      await stopRecorder(current.recorder)
      await current.queue
      current.sending = false
      await platform.stream.stop()
    } catch (error) {
      console.error('[stream] stop failed', error)
    } finally {
      // 'ended' olayı normalde bunları zaten yapmış olur.
      if (session == current) {
        releaseSession()
        setLiveStatus(liveConnectionTypes.connect)
        liveStats.value = null
      }
    }
  }

  return {
    getLiveStatus,
    getLiveStats,
    getLiveOptions,
    setLiveOptions,
    setChannel,
    loadLiveOptions,
    startStream,
    endStream,
  }
}
