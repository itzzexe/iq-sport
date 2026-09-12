import type { Metadata } from 'next'
import type { Branch } from '@/payload-types'
import { DivisionsJourney } from '@/components/pages/DivisionsJourney'
import { BackHome, JsonLd } from '@/components/ui/bits'
import { getDivisions, getGlobal, getSettings } from '@/lib/cms'
import { href, pageHref } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { resolveLocale, type LangParams } from '@/lib/params'
import { absoluteUrl, breadcrumbLd, buildMetadata, graph, webPageLd } from '@/lib/seo'

const PATH = '/divisions'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('divisions-page', locale, 1)])
  return buildMetadata({ settings, locale, path: PATH, title: page.title, description: page.intro, meta: page.meta })
}

export default async function DivisionsPage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, page, divisions] = await Promise.all([
    getSettings(locale),
    getGlobal('divisions-page', locale, 1),
    getDivisions(locale, 1),
  ])
  const t = makeT(settings, locale)

  const chapters = divisions.map((d) => ({
    slug: d.slug,
    title: d.title,
    kicker: d.kicker,
    summary: d.summary,
    icon: d.icon,
    highlights: (d.highlights ?? []).map((h) => h.label),
    branches: (d.branches ?? []).filter((b): b is Branch => typeof b === 'object').map((b) => b.title),
    figure: d.figure?.value ? { value: d.figure.value, suffix: d.figure.suffix, label: d.figure.label } : null,
  }))

  return (
    <>
      {/* The journey: the brand mark, then every sport in its own 3D scene. */}
      <DivisionsJourney
        items={chapters}
        intro={{ eyebrow: page.eyebrow, title: page.title, intro: page.intro }}
        locale={locale}
        labels={{
          explore: t('explore'),
          availableAt: t('availableAt'),
          hint: t('journeyHint'),
          lane: t('lane'),
          book: t('bookNow'),
          bookHref: pageHref(locale, 'contact'),
          start: t('startLine'),
          finish: t('finishLine'),
        }}
      />

      <BackHome locale={locale} t={t} />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, PATH, page.title, page.intro),
          breadcrumbLd(settings, locale, [{ name: settings.siteName, path: '/' }, { name: page.title, path: PATH }]),
          {
            '@type': 'ItemList',
            name: page.title,
            itemListElement: divisions.map((d, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: d.title,
              url: absoluteUrl(settings, href(locale, `${PATH}/${d.slug}`)),
            })),
          },
        )}
      />
    </>
  )
}
