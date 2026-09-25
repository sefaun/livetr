import type { useNode } from '@/composables/Node'
import type { channels, localeNames, mediaTypes, liveConnectionTypes, resolutions, fps } from '@/enums'
import type { TNode } from '@shared/model'

// Sahne ve node bar veri modeli renderer ile Electron ana süreci arasında ortaktır (shared/model.ts).
export type {
  TScreenNodeTypes,
  TNodeStyle,
  TTextNodeDataStyle,
  TTextNodeData,
  TMediaNodeData,
  TLiveSourceNodeData,
  TImageNodeData,
  TVideoNodeData,
  TSourceMediaNodeData,
  TLiveCameraNodeData,
  TBackgroundNodeData,
  TBackgroundSoundNodeData,
  TNode,
  TScene,
  TStudioData,
} from '@shared/model'

export type ValueOf<T> = T[keyof T]

export type TTheme = 'dark' | 'light'
export type TLocale = ValueOf<typeof localeNames>
export type TMediaTypes = ValueOf<typeof mediaTypes>
export type TChannels = ValueOf<typeof channels>
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

export type TuseNodeOptions = {
  options: TNode
}
