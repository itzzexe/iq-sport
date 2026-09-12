import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/payload/labels'

export { DEFAULT_LOCALE, LOCALES }
export type { Locale }

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value)

export const otherLocale = (locale: Locale): Locale => (locale === 'ar' ? 'en' : 'ar')

export const dirOf = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr')

/** BCP-47 tags used in <html lang>, hreflang and OpenGraph. */
export const LANG_TAG: Record<Locale, string> = { ar: 'ar-IQ', en: 'en' }
export const OG_LOCALE: Record<Locale, string> = { ar: 'ar_IQ', en: 'en_US' }

/** Public path for a page in a locale. Arabic has no prefix; English lives under /en. */
export function href(locale: Locale, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/** Route for each page key used by the CMS (nav links, tiles, CTAs). */
export const PAGE_PATHS = {
  home: '/',
  divisions: '/divisions',
  branches: '/branches',
  statistics: '/statistics',
  team: '/team',
  tournaments: '/tournaments',
  vision: '/vision',
  contact: '/#contact',
} as const
export type PageKey = keyof typeof PAGE_PATHS

export const pageHref = (locale: Locale, page?: string | null) =>
  href(locale, PAGE_PATHS[(page ?? 'home') as PageKey] ?? '/')

/** Strip a locale prefix from a browser pathname → canonical page path. */
export function stripLocale(pathname: string) {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return '/'
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1)
  }
  return pathname || '/'
}

/* --------------------------------------------------------- formatting */

export const formatNumber = (locale: Locale, n: number) =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-IQ' : 'en-US', { maximumFractionDigits: 0 }).format(n)

export const formatDate = (locale: Locale, iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Baghdad',
    ...opts,
  }).format(new Date(iso))

/** Date range like "١٥ يناير — ٢٠ يناير ٢٠٢٦" or "15 January 2026". */
export function formatDateRange(locale: Locale, start: string, end?: string | null) {
  if (!end || end === start) return formatDate(locale, start)
  const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Baghdad',
  })
  return fmt.formatRange(new Date(start), new Date(end))
}
