import { notFound } from 'next/navigation'
import { isLocale, type Locale } from './i18n'

export type LangParams = Promise<{ lang: string }>
export type SlugParams = Promise<{ lang: string; slug: string }>

/** Reads and validates the `[lang]` segment; anything else is a 404. */
export async function resolveLocale(params: LangParams | SlugParams): Promise<Locale> {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return lang
}
