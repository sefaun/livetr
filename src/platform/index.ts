import { createDesktopPlatform } from '@/platform/desktop'
import { createWebPlatform } from '@/platform/web'
import type { TPlatform } from '@/platform/types'

/**
 * Uygulama öncelikli olarak Electron masaüstü uygulaması olarak çalışır (window.livetr köprüsü mevcuttur).
 * Tarayıcıda açıldığında web platformuna düşer: arayüz çalışır, masaüstüne özel özellikler devre dışı kalır.
 */
export const platform: TPlatform = window.livetr ? createDesktopPlatform(window.livetr) : createWebPlatform()

export const isDesktop = platform.isDesktop
