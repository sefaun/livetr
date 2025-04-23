import type { TNode } from '@/types'

export const localeNames = {
  tr: 'tr',
  en: 'en',
} as const

export const screenNodeTypes = {
  text: 'text',
  image: 'image',
  video: 'video',
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
