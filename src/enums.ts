import type { InjectionKey } from 'vue'
import { screenNodeTypes } from '@shared/model'
import type { TLiveResolution, TNode, TuseNode } from '@/types'

export const NodeId: InjectionKey<TuseNode> = Symbol('nodeId')

export const localeNames = {
  tr: 'tr',
  en: 'en',
} as const

export const channels = {
  youtube: 'youtube',
  twitch: 'twitch',
  custom: 'custom',
} as const

export const channelRTMP = {
  youtube: 'rtmp://x.rtmp.youtube.com/live2/',
  twitch: 'rtmp://live.twitch.tv/app/',
  custom: '',
} as const

export const fps = [30, 60] as const

export { screenNodeTypes } from '@shared/model'

export const nodeData = {
  id: '',
  type: screenNodeTypes.text,
  position: {
    x: 0,
    y: 0,
  },
  style: {},
} as TNode

export const mediaTypes = {
  img: 'img',
  video: 'video',
} as const

export const liveConnectionTypes = {
  connect: 'connect',
  connecting: 'connecting',
  connected: 'connected',
  disconnecting: 'disconnecting',
} as const

export const volumeOptions = {
  max: 2,
  min: 0,
} as const

export const resolutions = {
  '1080p': '1920:1080',
  '720p': '1280:720',
  '480p': '854:480',
  '360p': '640:360',
  '160p': '284:160',
} as const

/** Çözünürlüğe göre yayının görüntü bitrate'i (kbps). Twitch ve YouTube önerileriyle uyumludur. */
export const videoBitrates: Record<TLiveResolution, number> = {
  [resolutions['1080p']]: 6000,
  [resolutions['720p']]: 4500,
  [resolutions['480p']]: 2500,
  [resolutions['360p']]: 1000,
  [resolutions['160p']]: 300,
}

/** Yayının ses bitrate'i (kbps, AAC). */
export const audioBitrate = 128

/**
 * Editördeki sahne alanının mantıksal boyutu. Node konum ve boyutları bu koordinat sisteminde tutulur;
 * sahne pencere boyutuna göre CSS ile ölçeklenir, yayın canvas'ına da bu oranla çizilir.
 */
export const stageSize = {
  width: 960,
  height: 540,
} as const

/** Metin node'larında satır yüksekliği (editör ve yayın canvas'ı aynı değeri kullanır). */
export const textLineHeight = 1.2

/**
 * MediaRecorder ile ffmpeg'e aktarılan ara kodlama için tercih sırası.
 * ffmpeg bu akışı yayın platformlarının istediği H.264/AAC formatına dönüştürür.
 */
export const recorderMimeTypes = [
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=h264,opus',
  'video/webm',
] as const

export const fontFamilies = [
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" },
  { name: 'Times New Roman', value: "Georgia, 'Times New Roman', Times, serif" },
  { name: 'Verdana', value: 'Verdana, Geneva, Tahoma, sans-serif' },
  {
    name: 'Lucida Sans',
    value: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
  },
  {
    name: 'Gill Sans',
    value: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
  },
] as const
