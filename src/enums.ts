import type { InjectionKey } from 'vue'
import type { TNode, TuseNode } from '@/types'

export const NodeId: InjectionKey<TuseNode> = Symbol('nodeId')

export const localeNames = {
  tr: 'tr',
  en: 'en',
} as const

export const channels = {
  youtube: 'youtube',
  twitch: 'twitch',
} as const

export const channelRTMP = {
  youtube: import.meta.env.VITE_YOUTUBE_RTMP,
  twitch: import.meta.env.VITE_TWITCH_RTMP,
} as const

export const fps = [30, 60] as const

export const screenNodeTypes = {
  text: 'text',
  image: 'image',
  video: 'video',
  sourceMedia: 'sourceMedia',
  liveCamera: 'liveCamera',
  background: 'background',
} as const

export const nodeData = {
  id: '',
  type: screenNodeTypes.text,
  position: {
    x: 0,
    y: 0,
  },
  style: {},
  default: false,
} as TNode

export const mediaTypes = {
  img: 'img',
  video: 'video',
} as const

export const liveConnectionTypes = {
  connect: 'connect',
  connecting: 'connecting',
  connected: 'connected',
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

export const ffmpegBitrateOptions = {
  [resolutions['1080p']]: ['-b:v 6000k', '-maxrate 6000k', '-bufsize 12000k'],
  [resolutions['720p']]: ['-b:v 4500k', '-maxrate 4500k', '-bufsize 9000k'],
  [resolutions['480p']]: ['-b:v 2500k', '-maxrate 2500k', '-bufsize 5000k'],
  [resolutions['360p']]: ['-b:v 1000k', '-maxrate 1000k', '-bufsize 2000k'],
  [resolutions['160p']]: ['-b:v 300k', '-maxrate 300k', '-bufsize 600k'],
} as const

export const mainFilePath = 'store' as const
export const filePaths = {
  studio: `${mainFilePath}/studio.json`,
  nodebar: `${mainFilePath}/nodebar.json`,
  scene: `${mainFilePath}/scene`,
} as const

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
