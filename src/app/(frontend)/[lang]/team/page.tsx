import type { Metadata } from 'next'
import { CoachCard } from '@/components/pages/cards'
import { Reveal } from '@/components/ui/Reveal'
import { BackHome, JsonLd, PageHero } from '@/components/ui/bits'
import { getCoaches, getGlobal, getSettings } from '@/lib/cms'
import { makeT } from '@/lib/labels'
import { isMedia } from '@/lib/media'
import { resolveLocale, type LangParams } from '@/lib/params'
import { absoluteUrl, breadcrumbLd, buildMetadata, graph, siteOrigin, webPageLd } from '@/lib/seo'

const PATH = '/team'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('team-page', locale, 1)])
  return buildMetadata({ settings, locale, path: PATH, title: page.title, description: page.intro, meta: page.meta })
}

export default async function TeamPage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, page, coaches] = await Promise.all([getSettings(locale), getGlobal('team-page', locale, 1), getCoaches(locale)])
  const t = makeT(settings, locale)
  const summary = page.summary ?? []

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
        {summary.length > 0 && (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {summary.map((row, i) => (
              <div key={row.id ?? i}>
                <dt className="text-sm text-n-500">{row.label}</dt>
                <dd className="mt-1 text-base text-green">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

      <Reveal className="shell py-[clamp(3rem,8vh,6rem)]">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {coaches.map((c, i) => (
            <li key={c.id}>
              <CoachCard coach={c} index={i} t={t} locale={locale} />
            </li>
          ))}
        </ul>
      </Reveal>

      <BackHome locale={locale} t={t} />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, PATH, page.title, page.intro),
          breadcrumbLd(settings, locale, [{ name: settings.siteName, path: '/' }, { name: page.title, path: PATH }]),
          {
            '@type': 'ItemList',
            name: page.title,
            itemListElement: coaches.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Person',
                name: c.name,
                jobTitle: c.role,
                image: isMedia(c.photo) ? absoluteUrl(settings, c.photo.url ?? '') : undefined,
                worksFor: { '@id': `${siteOrigin(settings)}/#organization` },
              },
            })),
          },
        )}
      />
    </>
  )
}
