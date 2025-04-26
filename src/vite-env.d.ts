/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_MODE: 'development' | 'production'
  VITE_THEME: 'theme'
  VITE_LANG: 'lang'
  VITE_CHANNEL: string
  VITE_YOUTUBE_RTMP: 'rtmp://x.rtmp.youtube.com/live2/'
  VITE_TWITCH_RTMP: 'rtmp://live.twitch.tv/app/'
  VITE_RTMP_KEY: string
  VITE_STREAM_FPS: string
}
