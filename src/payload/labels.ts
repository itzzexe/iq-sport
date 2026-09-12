/** Bilingual admin label — every field in the CMS is labelled in Arabic and English. */
export const L = (ar: string, en: string) => ({ ar, en })

/** Public site locales. Arabic is the default (no URL prefix); English lives under /en. */
export const LOCALES = ['ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ar'
