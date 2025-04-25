import { nodeEvents } from '@/composables/events'
import { useNode } from '@/composables/Node'
import { localeNames, mediaTypes, screenNodeTypes } from '@/enums'

export type ValueOf<T> = T[keyof T]

export type TTheme = 'dark' | 'light'
export type TLocale = ValueOf<typeof localeNames>
export type TMediaTypes = ValueOf<typeof mediaTypes>

export type TScreenNodeTypes = ValueOf<typeof screenNodeTypes>
export type TuseNode = ReturnType<typeof useNode>

export type TTextNodeData = {
  text: string
}

export type TImageNodeData = {
  title: string
  src: string
}

export type TVideoNodeData = {
  title: string
  src: string
}

export type TBackgroundNodeData = {
  title: string
  src: string
}

export type TNode = {
  id: string
  type: TScreenNodeTypes
  position: {
    x: number
    y: number
  }
  style: Partial<CSSStyleDeclaration>
  data: TTextNodeData | TImageNodeData | TVideoNodeData | TBackgroundNodeData
}

export type TuseNodeOptions = {
  options: TNode
}

export type TNodeEvents = ValueOf<typeof nodeEvents>

export type TNodeZIndexMessage = {
  id: string
}

export type TNodeEventMessage<T> = T

export type TNodeEventListenerData = TNodeZIndexMessage
