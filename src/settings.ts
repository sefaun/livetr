/**
 * Kullanıcı ayarlarının localStorage anahtarları.
 * Önceki sürümlerde bu anahtarlar .env dosyalarından okunuyordu; aynı değerler korunarak mevcut ayarlar geçerli kalır.
 */
export const settingKeys = {
  theme: 'theme',
  lang: 'lang',
  channel: 'channel',
  rtmpUrl: 'rtmp-url',
  rtmpKey: 'rtmpKey',
  fps: 'fps',
  resolution: 'resolution',
  activeScene: 'active-scene',
  record: 'record',
} as const

export type TSettingKey = keyof typeof settingKeys

export function readSetting(key: TSettingKey) {
  try {
    return localStorage.getItem(settingKeys[key])
  } catch (_error) {
    return null
  }
}

export function writeSetting(key: TSettingKey, value: string) {
  try {
    localStorage.setItem(settingKeys[key], value)
  } catch (error) {
    console.warn(`[settings] ${key} could not be saved`, error)
  }
}
