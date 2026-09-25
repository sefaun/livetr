import type { useNode } from '@/composables/Node'
import type { channels, localeNames, mediaTypes, screenNodeTypes, liveConnectionTypes, resolutions, fps } from '@/enums'

export type ValueOf<T> = T[keyof T]

export type TTheme = 'dark' | 'light'
export type TLocale = ValueOf<typeof localeNames>
export type TMediaTypes = ValueOf<typeof mediaTypes>
export type TChannels = ValueOf<typeof channels>
export type TScreenNodeTypes = ValueOf<typeof screenNodeTypes>
export type TLiveConnectionTypes = ValueOf<typeof liveConnectionTypes>
export type TLiveResolution = ValueOf<typeof resolutions>
export type TFps = (typeof fps)[number]
export type TuseNode = ReturnType<typeof useNode>

export type TLiveOptions = {
  /** Özel (custom) kanal için RTMP sunucu adresi. YouTube/Twitch adresleri sabittir. */
  rtmp: string
  fps: TFps
  rtmpKey: string
  resolution: TLiveResolution
  /** Yayınla birlikte yerel kayıt alınır. */
  record: boolean
}

export type TTextNodeDataStyle = {
  fontSize: number
  fontFamily: string
  color: string
}

export type TTextNodeData = {
  text: string
  style: TTextNodeDataStyle
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
  /** Sahnenin mantıksal koordinat sisteminde (stageSize) konum. */
  position: {
    x: number
    y: number
  }
  style: Partial<CSSStyleDeclaration>
  data:
    | TTextNodeData
    | TImageNodeData
    | TVideoNodeData
    | TSourceMediaNodeData
    | TLiveCameraNodeData
    | TBackgroundNodeData
    | TBackgroundSoundNodeData
}

export type TScene = {
  sceneId: string
  nodes: TNode[]
}

export type TStudioData = {
  scene: TScene[]
}

export type TuseNodeOptions = {
  options: TNode
}
