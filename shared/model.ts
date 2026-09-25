/**
 * Stüdyo verilerinin (sahneler ve node bar öğeleri) kalıcı modeli.
 * Hem renderer (Vue) hem Electron ana süreci kullanır; DOM ya da Node.js tiplerine bağımlı değildir.
 */

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

/** Node'un CSS stili. Boyutlar mantıksal piksel ('150px'), yüzde ya da 'fit-content'; zIndex metin olarak tutulur. */
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

/** Dosyadan gelen medya: resim, video, arka plan ve arka plan sesi. `src` yerel dosya yolu ya da URL'dir. */
export type TMediaNodeData = {
  title: string
  src: string
}

/** Canlı kaynak: kamera (`id` = deviceId) ya da ekran/pencere (`id` = desktopCapturer kaynak kimliği). */
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
  /** Sahnenin mantıksal koordinat sisteminde konum. */
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
