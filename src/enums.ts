import type { TNode } from '@/types'

export const localeNames = {
  tr: 'tr',
  en: 'en',
} as const

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
