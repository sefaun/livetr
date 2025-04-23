import type { localeNames } from '@/enums'

export type ValueOf<T> = T[keyof T]

export type TTheme = 'dark' | 'light'
export type TLocale = ValueOf<typeof localeNames>
