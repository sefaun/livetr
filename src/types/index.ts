import { nodeEvents } from '@/composables/events'
import { useNode } from '@/composables/Node'
import { localeNames, screenNodeTypes } from '@/enums'

export type ValueOf<T> = T[keyof T]

export type TTheme = 'dark' | 'light'
export type TLocale = ValueOf<typeof localeNames>

export type TScreenNodeTypes = ValueOf<typeof screenNodeTypes>
export type TuseNode = ReturnType<typeof useNode>
export type TuseNodeOptions = {
  options: TNode
}
export type TNode = {
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  style: CSSStyleDeclaration
}

export type TNodeEvents = ValueOf<typeof nodeEvents>

export type TNodeZIndexMessage = {
  id: string
}

export type TNodeEventMessage<T> = T

export type TNodeEventListenerData = TNodeZIndexMessage
