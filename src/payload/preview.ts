import type { CollectionConfig, GlobalConfig } from 'payload'

/** Public path for a locale: Arabic is unprefixed, English lives under /en. */
export const localizedPath = (path: string, locale: string) => {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === 'en') return clean === '/' ? '/en' : `/en${clean}`
  return clean
}

/**
 * Live-preview / preview URL for the admin. Goes through /next/preview which
 * checks the admin session, switches Next.js into draft mode and redirects to
 * the page — so unpublished drafts render for editors only.
 */
export const previewURL = (path: string, locale: string) => {
  const params = new URLSearchParams({
    path: localizedPath(path, locale),
    previewSecret: process.env.PREVIEW_SECRET || '',
  })
  return `/next/preview?${params.toString()}`
}

type GlobalPreview = NonNullable<NonNullable<GlobalConfig['admin']>['livePreview']>
type CollectionPreview = NonNullable<NonNullable<CollectionConfig['admin']>['livePreview']>

export const globalPreview = (path: string): GlobalPreview => ({
  url: ({ locale }) => previewURL(path, locale.code),
})

export const collectionPreview = (prefix: string): CollectionPreview => ({
  url: ({ data, locale }) => (data?.slug ? previewURL(`${prefix}/${data.slug}`, locale.code) : null),
})
