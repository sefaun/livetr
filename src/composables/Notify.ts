import { ElNotification } from 'element-plus'

type TNotifyType = 'success' | 'warning' | 'info' | 'error'

/**
 * Uygulama içi bildirim. Bildirimler üst menünün altında açılır; böylece sağ üstteki
 * canlı yayın butonunun üzerini kapatmaz (yayın her an durdurulabilmeli).
 */
export function notify(type: TNotifyType, message: string, options: { title?: string; duration?: number } = {}) {
  return ElNotification({
    type,
    message,
    offset: 72,
    ...options,
  })
}
