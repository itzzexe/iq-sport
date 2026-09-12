import path from 'node:path'
import type { CollectionSlug, GlobalSlug, Payload } from 'payload'
import { UI_STRINGS } from '@/lib/ui-strings'
import { BRANCHES, COACHES, DIVISIONS, HOME, MEDIA, PAGES, SAMPLE_TOURNAMENTS, SETTINGS } from './content'

const CONTEXT = { disableRevalidate: true }
const CONTENT_COLLECTIONS: CollectionSlug[] = ['tournaments', 'coaches', 'divisions', 'branches', 'media']

type Data = Record<string, unknown>
type Loc = 'ar' | 'en'

/** Pick one language out of a bilingual value, recursively. */
function pick(value: unknown, locale: Loc): unknown {
  if (Array.isArray(value)) return value.map((v) => pick(v, locale))
  if (value && typeof value === 'object') {
    const obj = value as Data
    if ('ar' in obj && 'en' in obj && Object.keys(obj).length === 2) return obj[locale]
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, pick(v, locale)]))
  }
  return value
}
const loc = (value: unknown, l: Loc) => pick(value, l) as Data

/**
 * Array rows are shared between languages; only their text children are
 * localised. To fill the English side of an existing row the update must carry
 * that row's `id`, otherwise Payload treats the rows as new and drops the
 * Arabic ones. This copies ids from the saved Arabic document onto the English
 * payload, position by position.
 */
function attachRowIds(data: unknown, saved: unknown): unknown {
  if (Array.isArray(data)) {
    const rows = Array.isArray(saved) ? saved : []
    return data.map((row, i) => {
      const savedRow = rows[i] as Data | undefined
      const merged = attachRowIds(row, savedRow) as Data
      return savedRow?.id !== undefined ? { ...merged, id: savedRow.id } : merged
    })
  }
  if (data && typeof data === 'object') {
    const savedObj = (saved && typeof saved === 'object' ? saved : {}) as Data
    return Object.fromEntries(Object.entries(data as Data).map(([k, v]) => [k, attachRowIds(v, savedObj[k])]))
  }
  return data
}

type Ids = Record<string, number>

/** Deep-merges plain objects (groups); arrays and scalars from `b` win. */
function merge(a: Data, b: Data): Data {
  const out: Data = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const prev = out[k]
    if (v && typeof v === 'object' && !Array.isArray(v) && prev && typeof prev === 'object' && !Array.isArray(prev)) {
      out[k] = merge(prev as Data, v as Data)
    } else if (v !== undefined) {
      out[k] = v
    }
  }
  return out
}

/**
 * Writes the launch content into an empty CMS. `ensureSeeded` only calls this
 * when `settings.seededAt` is unset; `run.ts --reset` wipes content first.
 */
export async function seed(payload: Payload) {
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)
  const root = process.cwd()

  /* ---------------------------------------------------------- media */
  log('uploading media')
  const media: Ids = {}
  for (const [key, item] of Object.entries(MEDIA)) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: item.alt.ar },
      filePath: path.join(root, item.file),
      locale: 'ar',
      context: CONTEXT,
    })
    await payload.update({ collection: 'media', id: doc.id, data: { alt: item.alt.en }, locale: 'en', context: CONTEXT })
    media[key] = doc.id
  }
  const img = (key?: string) => (key ? media[key] : undefined)

  /** create in Arabic, then fill English on the same rows */
  async function createBilingual(collection: CollectionSlug, shared: Data, localized: unknown, draft = false): Promise<number> {
    const status = draft ? 'draft' : 'published'
    const created = await payload.create({
      collection,
      data: merge({ ...shared, _status: status }, loc(localized, 'ar')) as never,
      draft,
      locale: 'ar',
      context: CONTEXT,
    })
    await payload.update({
      collection,
      id: created.id,
      data: { _status: status, ...(attachRowIds(loc(localized, 'en'), created) as Data) } as never,
      draft,
      locale: 'en',
      context: CONTEXT,
    })
    return created.id as number
  }

  /* ------------------------------------------------------- branches */
  log('creating branches')
  const branches: Ids = {}
  for (const b of BRANCHES) {
    branches[b.slug] = await createBilingual(
      'branches',
      { slug: b.slug, order: b.order, image: img(b.image), mapPosition: b.mapPosition },
      { title: b.title, area: b.area, address: b.address, facilities: b.facilities.map((label) => ({ label })) },
    )
  }

  /* ------------------------------------------------------ divisions */
  log('creating divisions')
  const divisions: Ids = {}
  for (const d of DIVISIONS) {
    divisions[d.slug] = await createBilingual(
      'divisions',
      {
        slug: d.slug,
        order: d.order,
        icon: d.icon,
        image: img(d.image),
        bookable: true,
        branches: d.branches.map((s) => branches[s]),
      },
      {
        title: d.title,
        kicker: d.kicker,
        summary: d.summary,
        lede: d.lede,
        story: d.story.map((text) => ({ text })),
        features: d.features,
        highlights: d.highlights.map((label) => ({ label })),
        figure: d.figure ? { value: d.figure.value, suffix: d.figure.suffix ?? '', label: d.figure.label } : undefined,
      },
    )
  }

  /* -------------------------------------------------------- coaches */
  log('creating coaches')
  const coaches: Ids = {}
  for (const c of COACHES) {
    coaches[c.key] = await createBilingual(
      'coaches',
      { order: c.order, photo: img(c.photo), division: divisions[c.division], branch: branches[c.branch] },
      { name: c.name, role: c.role },
    )
  }
  for (const d of DIVISIONS) {
    if (d.coaches.length === 0) continue
    await payload.update({
      collection: 'divisions',
      id: divisions[d.slug],
      data: { coaches: d.coaches.map((k) => coaches[k]), _status: 'published' },
      context: CONTEXT,
    })
  }

  /* ------------------------------------------- example tournaments */
  log('creating example tournaments (drafts)')
  for (const t of SAMPLE_TOURNAMENTS) {
    await createBilingual(
      'tournaments',
      {
        slug: t.slug,
        kind: t.kind,
        cover: img(t.cover),
        startDate: t.startDate,
        endDate: (t as { endDate?: string }).endDate,
        division: divisions[t.division],
        branch: branches[t.branch],
      },
      { title: t.title, summary: t.summary, highlights: t.highlights },
      true,
    )
  }

  /* -------------------------------------------------------- globals */
  log('writing globals')
  async function updateBilingualGlobal(slug: GlobalSlug, shared: Data, localized: unknown) {
    const saved = await payload.updateGlobal({
      slug,
      data: merge(shared, loc(localized, 'ar')) as never,
      locale: 'ar',
      context: CONTEXT,
    })
    await payload.updateGlobal({
      slug,
      data: attachRowIds(loc(localized, 'en'), saved) as never,
      locale: 'en',
      context: CONTEXT,
    })
  }

  const labels = (l: Loc) => Object.fromEntries(Object.entries(UI_STRINGS).map(([k, v]) => [k, v[l]]))
  await updateBilingualGlobal(
    'settings',
    {
      phone: SETTINGS.phone,
      whatsapp: SETTINGS.whatsapp,
      email: SETTINGS.email,
      mapsUrl: SETTINGS.mapsUrl,
      socials: SETTINGS.socials,
      siteUrl: SETTINGS.siteUrl,
      ogImage: img('og-default'),
      allowIndexing: true,
    },
    {
      siteName: SETTINGS.siteName,
      shortName: SETTINGS.shortName,
      tagline: SETTINGS.tagline,
      address: SETTINGS.address,
      city: SETTINGS.city,
      country: SETTINGS.country,
      hours: SETTINGS.hours,
      nav: SETTINGS.nav,
      footerText: SETTINGS.footerText,
      copyright: SETTINGS.copyright,
      defaultTitle: SETTINGS.defaultTitle,
      defaultDescription: SETTINGS.defaultDescription,
      keywords: SETTINGS.keywords.map((keyword) => ({ keyword })),
      labels: { ar: labels('ar'), en: labels('en') },
    },
  )

  // Non-localised bits of the home page (images, targets) ride along with the Arabic write;
  // tile images are per-row so they are set in the shared data of each row.
  const tiles = (l: Loc) =>
    HOME.sections.tiles.map((t) => ({ page: t.page, title: t.title[l], blurb: t.blurb[l], image: img(t.image), enabled: true }))
  await updateBilingualGlobal(
    'home',
    {
      hero: { background: img(HOME.hero.background), primaryCta: { target: HOME.hero.primaryCta.target }, secondaryCta: { target: HOME.hero.secondaryCta.target } },
      about: { image: img(HOME.about.image) },
      meta: { image: img('og-default') },
    },
    {
      hero: {
        title: HOME.hero.title,
        subtitle: HOME.hero.subtitle,
        primaryCta: { label: HOME.hero.primaryCta.label },
        secondaryCta: { label: HOME.hero.secondaryCta.label },
      },
      about: {
        eyebrow: HOME.about.eyebrow,
        title: HOME.about.title,
        paragraphs: HOME.about.paragraphs.map((text) => ({ text })),
        pillars: HOME.about.pillars.map((label) => ({ label })),
      },
      sections: { eyebrow: HOME.sections.eyebrow, title: HOME.sections.title, intro: HOME.sections.intro, tiles: { ar: tiles('ar'), en: tiles('en') } },
      contact: HOME.contact,
      meta: HOME.meta,
    },
  )

  const { mapImage: branchesMap, ...branchesPage } = PAGES.branches
  const { image: visionImage, ...visionPage } = PAGES.vision
  await updateBilingualGlobal('divisions-page', {}, PAGES.divisions)
  await updateBilingualGlobal('branches-page', { mapImage: img(branchesMap) }, branchesPage)
  await updateBilingualGlobal('statistics-page', {}, PAGES.statistics)
  await updateBilingualGlobal('team-page', {}, PAGES.team)
  await updateBilingualGlobal('tournaments-page', {}, PAGES.tournaments)
  await updateBilingualGlobal('vision-page', { image: img(visionImage) }, visionPage)

  await payload.updateGlobal({ slug: 'settings', data: { seededAt: new Date().toISOString() }, context: CONTEXT })
  log('done')
}

/** Removes every content document (and uploaded file) so `seed` can start clean. Destructive. */
export async function resetContent(payload: Payload) {
  for (const collection of CONTENT_COLLECTIONS) {
    await payload.delete({ collection, where: { id: { exists: true } }, context: CONTEXT })
  }
  await payload.updateGlobal({ slug: 'settings', data: { seededAt: null }, context: CONTEXT })
}
