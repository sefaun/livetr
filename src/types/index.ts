import { useNode } from '@/composables/Node'
import { channels, localeNames, mediaTypes, screenNodeTypes, liveConnectionTypes, resolutions } from '@/enums'

export type ValueOf<T> = T[keyof T]

export type TTheme = 'dark' | 'light'
export type TLocale = ValueOf<typeof localeNames>
export type TMediaTypes = ValueOf<typeof mediaTypes>
export type TChannels = ValueOf<typeof channels>
export type TScreenNodeTypes = ValueOf<typeof screenNodeTypes>
export type TLiveConnectionTypes = ValueOf<typeof liveConnectionTypes>
export type TLiveResolution = ValueOf<typeof resolutions>
export type TuseNode = ReturnType<typeof useNode>

export type TLiveOptions = {
  rtmp: string
  fps: number
  rtmpKey: string
  resolution: TLiveResolution
}

export type TTextNodeDataStyle = {
  fontSize: number
  fontFamily: string
  color: string
}

export type TTextNodeData = {
  text: string
  style: {
    fontSize: number
    fontFamily: string
    color: string
  }
}

export type TImageNodeData = {
  title: string
  src: string
}

export type TVideoNodeData = {
  title: string
  src: string
}

export type TSourceMediaNodeData = {
  id: string
  title: string
}

export type TLiveCameraNodeData = {
  id: string
  title: string
}

export type TBackgroundNodeData = {
  title: string
  src: string
}

export type TBackgroundSoundNodeData = {
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
  data: TTextNodeData | TImageNodeData | TVideoNodeData | TSourceMediaNodeData | TBackgroundNodeData
}

export type TuseNodeOptions = {
  options: TNode
}

export type TLocalSource = {
  id: string
  name: string
  thumbnail: string
}
