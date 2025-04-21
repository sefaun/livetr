/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_MODE: 'development' | 'production'
  VITE_THEME: 'theme'
  VITE_MQTT_HOST: string
  VITE_ADMIN_ID: string
}
