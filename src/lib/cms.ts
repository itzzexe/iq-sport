import 'server-only'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload, type CollectionSlug, type DataFromCollectionSlug, type DataFromGlobalSlug, type GlobalSlug, type Sort, type Where } from 'payload'
import config from '@payload-config'
import type { Locale } from './i18n'

export const payloadClient = () => getPayload({ config })

/** Draft mode is on only for editors coming through /next/preview. */
async function isDraft() {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

/**
 * Every read goes through here. Published content is cached by Next.js and
 * tagged so a CMS write (see payload/hooks/revalidate.ts) purges it; draft
 * previews bypass the cache and see unpublished changes.
 */
async function cached<T>(key: string[], tags: string[], fetcher: () => Promise<T>): Promise<T> {
  if (await isDraft()) return fetcher()
  return unstable_cache(fetcher, key, { tags: ['site', ...tags] })()
}

/* ------------------------------------------------------------- globals */

export async function getGlobal<T extends GlobalSlug>(slug: T, locale: Locale, depth = 2): Promise<DataFromGlobalSlug<T>> {
  const draft = await isDraft()
  return cached(['global', slug, locale, String(depth)], [`global_${slug}`], async () => {
    const payload = await payloadClient()
    return payload.findGlobal({ slug, locale, depth, draft, overrideAccess: true })
  })
}

export const getSettings = (locale: Locale) => getGlobal('settings', locale, 1)

/* --------------------------------------------------------- collections */

type FindOpts = { where?: Where; sort?: Sort; limit?: number; depth?: number }

export async function findDocs<T extends CollectionSlug>(
  collection: T,
  locale: Locale,
  opts: FindOpts = {},
): Promise<DataFromCollectionSlug<T>[]> {
  const draft = await isDraft()
  const key = ['find', collection, locale, JSON.stringify(opts)]
  return cached(key, [collection], async () => {
    const payload = await payloadClient()
    const res = await payload.find({
      collection,
      locale,
      depth: opts.depth ?? 2,
      limit: opts.limit ?? 200,
      pagination: false,
      sort: opts.sort,
      where: opts.where,
      draft,
      // With overrideAccess=false the collection's access control applies, so
      // anonymous reads only ever see published documents.
      overrideAccess: draft,
    })
    return res.docs
  })
}

export async function findBySlug<T extends CollectionSlug>(collection: T, slug: string, locale: Locale, depth = 2) {
  const docs = await findDocs(collection, locale, { where: { slug: { equals: slug } }, limit: 1, depth })
  return docs[0] ?? null
}

export const getDivisions = (locale: Locale, depth = 1) => findDocs('divisions', locale, { sort: 'order', depth })
export const getDivision = (slug: string, locale: Locale) => findBySlug('divisions', slug, locale, 2)
export const getBranches = (locale: Locale, depth = 1) => findDocs('branches', locale, { sort: 'order', depth })
export const getCoaches = (locale: Locale) => findDocs('coaches', locale, { sort: 'order', depth: 1 })
/** Coaches whose own "division" field points at this division (the division's "coaches" list is the other direction). */
export const getCoachesOfDivision = (divisionId: number, locale: Locale) =>
  findDocs('coaches', locale, { where: { division: { equals: divisionId } }, sort: 'order', depth: 1 })
export const getTournaments = (locale: Locale) => findDocs('tournaments', locale, { sort: '-startDate', depth: 1 })
export const getTournament = (slug: string, locale: Locale) => findBySlug('tournaments', slug, locale, 2)

/** Slugs for static generation — published only, both languages share slugs. */
export async function publishedSlugs(collection: 'divisions' | 'tournaments') {
  const payload = await payloadClient()
  const res = await payload.find({
    collection,
    depth: 0,
    limit: 500,
    pagination: false,
    overrideAccess: false,
    select: { slug: true },
  })
  return res.docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
}
