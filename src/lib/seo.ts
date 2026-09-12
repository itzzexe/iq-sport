import type { Metadata } from 'next'
import type { Media, Setting } from '@/payload-types'
import { href, LANG_TAG, LOCALES, OG_LOCALE, type Locale } from './i18n'
import { isMedia, mediaUrl } from './media'
import { serverURL } from './server-url'

/** Canonical origin: CMS setting first, then env, then localhost. No trailing slash. */
export function siteOrigin(settings?: Pick<Setting, 'siteUrl'> | null) {
  const raw = settings?.siteUrl?.trim() || serverURL()
  return raw.replace(/\/+$/, '')
}

export const absoluteUrl = (settings: Pick<Setting, 'siteUrl'> | null | undefined, path: string) =>
  /^https?:\/\//i.test(path) ? path : `${siteOrigin(settings)}${path.startsWith('/') ? path : `/${path}`}`

type MetaGroup = { title?: string | null; description?: string | null; image?: number | Media | null } | undefined

type BuildArgs = {
  settings: Setting
  locale: Locale
  /** canonical page path without locale prefix, e.g. "/divisions/padel" */
  path: string
  title?: string | null
  description?: string | null
  /** per-page overrides from the SEO plugin */
  meta?: MetaGroup
  image?: number | Media | null
  type?: 'website' | 'article'
  noIndex?: boolean
}

/**
 * One place that turns CMS data into Next.js metadata: title, description,
 * canonical + hreflang alternates, OpenGraph/Twitter cards and robots.
 */
export function buildMetadata(args: BuildArgs): Metadata {
  const { settings, locale, path, meta } = args
  const origin = siteOrigin(settings)
  const siteName = settings.siteName
  // Page titles get the brand appended unless the editor already wrote a composed
  // "Page | Brand" title in the SEO tab.
  const withBrand = (t: string) => (t.includes('|') || t.includes(siteName) ? t : `${t} | ${siteName}`)
  const custom = meta?.title?.trim() || args.title?.trim()
  const title = custom ? withBrand(custom) : settings.defaultTitle || siteName
  const description = (meta?.description?.trim() || args.description?.trim() || settings.defaultDescription || '').slice(0, 300)

  const image = [meta?.image, args.image, settings.ogImage].find(isMedia)
  const ogUrl = image ? absoluteUrl(settings, mediaUrl(image, 'og') ?? '') : `${origin}/og-default.jpg`

  const languages = Object.fromEntries(LOCALES.map((l) => [LANG_TAG[l], `${origin}${href(l, path)}`]))
  languages['x-default'] = `${origin}${href('ar', path)}`

  const index = settings.allowIndexing !== false && !args.noIndex

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${origin}${href(locale, path)}`, languages },
    openGraph: {
      type: args.type ?? 'website',
      siteName,
      title,
      description,
      url: `${origin}${href(locale, path)}`,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : { index: false, follow: false },
  }
}

/* ------------------------------------------------------------ JSON-LD */

export type JsonLd = Record<string, unknown>

export function organizationLd(settings: Setting, locale: Locale): JsonLd {
  const origin = siteOrigin(settings)
  return {
    '@type': 'SportsOrganization',
    '@id': `${origin}/#organization`,
    name: settings.siteName,
    url: origin,
    logo: `${origin}/apple-icon.png`,
    image: `${origin}/og-default.jpg`,
    description: settings.defaultDescription || undefined,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressLocality: settings.city || undefined,
          addressCountry: 'IQ',
        }
      : undefined,
    sameAs: (settings.socials ?? []).map((s) => s.url).filter(Boolean),
    inLanguage: LANG_TAG[locale],
  }
}

export function websiteLd(settings: Setting, locale: Locale): JsonLd {
  const origin = siteOrigin(settings)
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: settings.siteName,
    publisher: { '@id': `${origin}/#organization` },
    inLanguage: LANG_TAG[locale],
  }
}

export function breadcrumbLd(settings: Setting, locale: Locale, crumbs: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(settings, href(locale, c.path)),
    })),
  }
}

export function webPageLd(settings: Setting, locale: Locale, path: string, name: string, description?: string | null): JsonLd {
  const origin = siteOrigin(settings)
  return {
    '@type': 'WebPage',
    '@id': `${origin}${href(locale, path)}#webpage`,
    url: `${origin}${href(locale, path)}`,
    name,
    description: description || undefined,
    isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#organization` },
    inLanguage: LANG_TAG[locale],
  }
}

/** Wraps several nodes in one @graph document. */
export const graph = (...nodes: (JsonLd | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
})
