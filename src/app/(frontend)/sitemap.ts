import type { MetadataRoute } from 'next'
import { getSettings, publishedSlugs } from '@/lib/cms'
import { href, LANG_TAG, LOCALES, PAGE_PATHS } from '@/lib/i18n'
import { siteOrigin } from '@/lib/seo'

export const revalidate = 3600

/** Every public page in both languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings('ar')
  const origin = siteOrigin(settings)
  const now = new Date()

  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) =>
    LOCALES.map((locale) => ({
      url: `${origin}${href(locale, path)}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [LANG_TAG[l], `${origin}${href(l, path)}`])),
      },
    }))

  const staticPaths = Object.values(PAGE_PATHS).filter((p) => !p.includes('#'))
  const [divisions, tournaments] = await Promise.all([publishedSlugs('divisions'), publishedSlugs('tournaments')])

  return [
    ...staticPaths.flatMap((p) => entry(p, p === '/' ? 1 : 0.8, p === '/tournaments' ? 'weekly' : 'monthly')),
    ...divisions.flatMap((slug) => entry(`/divisions/${slug}`, 0.7, 'monthly')),
    ...tournaments.flatMap((slug) => entry(`/tournaments/${slug}`, 0.6, 'weekly')),
  ]
}
