import type { Metadata } from 'next'
import { EventList } from '@/components/pages/EventList'
import { Reveal } from '@/components/ui/Reveal'
import { BackHome, JsonLd, PageHero } from '@/components/ui/bits'
import { getGlobal, getSettings, getTournaments } from '@/lib/cms'
import { href } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { resolveLocale, type LangParams } from '@/lib/params'
import { absoluteUrl, breadcrumbLd, buildMetadata, graph, webPageLd } from '@/lib/seo'

const PATH = '/tournaments'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('tournaments-page', locale, 1)])
  return buildMetadata({ settings, locale, path: PATH, title: page.title, description: page.intro, meta: page.meta })
}

export default async function TournamentsPage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, page, events] = await Promise.all([
    getSettings(locale),
    getGlobal('tournaments-page', locale, 1),
    getTournaments(locale),
  ])
  const t = makeT(settings, locale)

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} />

      <Reveal className="shell py-[clamp(3rem,8vh,6rem)]">
        <EventList
          events={events}
          locale={locale}
          emptyMessage={page.emptyMessage}
          labels={{
            all: t('all'),
            tournaments: t('tournaments'),
            courses: t('courses'),
            course: t('course'),
            tournament: t('tournament'),
            upcoming: t('upcoming'),
            past: t('past'),
            location: t('location'),
            details: t('details'),
          }}
        />
      </Reveal>

      <BackHome locale={locale} t={t} />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, PATH, page.title, page.intro),
          breadcrumbLd(settings, locale, [{ name: settings.siteName, path: '/' }, { name: page.title, path: PATH }]),
          events.length > 0
            ? {
                '@type': 'ItemList',
                name: page.title,
                itemListElement: events.map((e, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: e.title,
                  url: absoluteUrl(settings, href(locale, `${PATH}/${e.slug}`)),
                })),
              }
            : null,
        )}
      />
    </>
  )
}
