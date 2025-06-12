/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_MODE: 'development' | 'production'
  VITE_THEME: 'theme'
  VITE_LANG: 'lang'
  VITE_CHANNEL: string
  VITE_RTMP_KEY: string
  VITE_STREAM_FPS: string
  VITE_STREAM_RESOLUTION: string
  VITE_ACTIVE_SCENE: string
  VITE_RTMP_URL: string
}
