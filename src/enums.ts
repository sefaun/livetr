import type { TNode } from '@/types'

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
  style: {
    zIndex: '1000',
  },
} as TNode

export const mediaTypes = {
  img: 'img',
  video: 'video',
} as const

export const emitterEvents = {
  screen: {
    groundMouseUp: 'groundMouseUp',
  },
  node: {
    mouseDown: 'mouseDown',
  },
} as const

export const nodeEvents = {
  zIndex: 'zIndex',
} as const

export const liveConnectionTypes = {
  connect: 'connect',
  connecting: 'connecting',
  connected: 'connected',
} as const
