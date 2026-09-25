export const screenNodeTypes = {
  text: 'text',
  image: 'image',
  video: 'video',
  sourceMedia: 'sourceMedia',
  liveCamera: 'liveCamera',
  background: 'background',
  backgroundSound: 'backgroundSound',
} as const

export type TScreenNodeTypes = (typeof screenNodeTypes)[keyof typeof screenNodeTypes]

/** Boyutlar sahnenin mantıksal pikseli ('150px'), yüzde ya da 'fit-content' olabilir. */
export type TNodeStyle = {
  width?: string
  height?: string
  zIndex?: string
  [property: string]: string | undefined
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

/** `src`: yerel dosya yolu ya da URL. */
export type TMediaNodeData = {
  title: string
  src: string
}

/** `id`: kamera için deviceId, ekran/pencere için desktopCapturer kaynak kimliği. */
export type TLiveSourceNodeData = {
  id: string
  title: string
}

export type TImageNodeData = TMediaNodeData
export type TVideoNodeData = TMediaNodeData
export type TBackgroundNodeData = TMediaNodeData
export type TBackgroundSoundNodeData = TMediaNodeData
export type TSourceMediaNodeData = TLiveSourceNodeData
export type TLiveCameraNodeData = TLiveSourceNodeData

export type TNode = {
  id: string
  type: TScreenNodeTypes
  position: {
    x: number
    y: number
  }
  style: TNodeStyle
  data: TTextNodeData | TMediaNodeData | TLiveSourceNodeData
}

export type TScene = {
  sceneId: string
  nodes: TNode[]
}

export type TStudioData = {
  scene: TScene[]
}

export function isScreenNodeType(value: unknown): value is TScreenNodeTypes {
  return Object.values<string>(screenNodeTypes).includes(value as string)
}
