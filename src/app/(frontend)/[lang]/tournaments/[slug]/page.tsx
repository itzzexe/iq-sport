import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Branch, Division } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { Arrow, BackHome, Eyebrow, JsonLd, PageHero } from '@/components/ui/bits'
import { getSettings, getTournament, publishedSlugs } from '@/lib/cms'
import { formatDateRange, href, LOCALES } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { isMedia } from '@/lib/media'
import { resolveLocale, type SlugParams } from '@/lib/params'
import { absoluteUrl, breadcrumbLd, buildMetadata, graph, siteOrigin, webPageLd } from '@/lib/seo'

export async function generateStaticParams() {
  const slugs = await publishedSlugs('tournaments')
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { slug } = await params
  const [settings, event] = await Promise.all([getSettings(locale), getTournament(slug, locale)])
  if (!event) return {}
  return buildMetadata({
    settings,
    locale,
    path: `/tournaments/${event.slug}`,
    title: event.title,
    description: event.summary,
    meta: event.meta,
    image: event.cover,
    type: 'article',
  })
}

export default async function TournamentPage({ params }: { params: SlugParams }) {
  const locale = await resolveLocale(params)
  const { slug } = await params
  const [settings, event] = await Promise.all([getSettings(locale), getTournament(slug, locale)])
  if (!event) notFound()
  const t = makeT(settings, locale)

  const branch = event.branch && typeof event.branch === 'object' ? (event.branch as Branch) : null
  const division = event.division && typeof event.division === 'object' ? (event.division as Division) : null
  const place = event.location || branch?.title
  const path = `/tournaments/${event.slug}`
  const isCourse = event.kind === 'course'
  const highlights = event.highlights ?? []
  const gallery = (event.gallery ?? []).filter((g) => isMedia(g.image))
  const origin = siteOrigin(settings)

  return (
    <>
      <PageHero eyebrow={isCourse ? t('course') : t('tournament')} title={event.title} intro={event.summary} image={event.cover}>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <dt className="text-sm text-n-500">{t('date')}</dt>
            <dd className="mt-1 text-base text-green">
              <time dateTime={event.startDate}>{formatDateRange(locale, event.startDate, event.endDate)}</time>
            </dd>
          </div>
          {place && (
            <div>
              <dt className="text-sm text-n-500">{t('location')}</dt>
              <dd className="mt-1 text-base text-paper">{place}</dd>
            </div>
          )}
          {division && (
            <div>
              <dt className="text-sm text-n-500">{t('division')}</dt>
              <dd className="mt-1 text-base">
                <Link href={href(locale, `/divisions/${division.slug}`)} className="text-paper transition-colors hover:text-green">
                  {division.title}
                </Link>
              </dd>
            </div>
          )}
        </dl>
        {event.registrationUrl && (
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="u-btn u-btn-primary mt-8">
            {t('register')}
            <Arrow />
          </a>
        )}
      </PageHero>

      <Reveal className="shell grid gap-[clamp(2.5rem,6vw,5rem)] py-[clamp(3rem,8vh,6rem)] lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RichText data={event.body} className="js-reveal max-w-[68ch]" />
        </div>
        {highlights.length > 0 && (
          <aside className="lg:col-span-4">
            <dl className="u-card divide-y divide-white/10 px-6">
              {highlights.map((h, i) => (
                <div key={h.id ?? i} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="text-sm text-n-400">{h.label}</dt>
                  <dd className="text-base text-paper">{h.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </Reveal>

      {gallery.length > 0 && (
        <Reveal className="shell pb-[clamp(3rem,8vh,6rem)]">
          <Eyebrow>{t('gallery')}</Eyebrow>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {gallery.map((g, i) => (
              <li key={g.id ?? i} className="js-reveal" style={{ '--i': i % 3 } as React.CSSProperties}>
                <Media media={g.image} size="card" className="aspect-[4/3] rounded-[var(--radius-card)]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <BackHome
        locale={locale}
        t={t}
        extra={
          <Link href={href(locale, '/tournaments')} className="text-sm text-n-400 transition-colors hover:text-green">
            {t('viewAll')}
          </Link>
        }
      />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, path, event.title, event.summary),
          breadcrumbLd(settings, locale, [
            { name: settings.siteName, path: '/' },
            { name: t('tournaments'), path: '/tournaments' },
            { name: event.title, path },
          ]),
          isCourse
            ? {
                '@type': 'Course',
                name: event.title,
                description: event.summary,
                provider: { '@id': `${origin}/#organization` },
                image: isMedia(event.cover) ? absoluteUrl(settings, event.cover.url ?? '') : undefined,
                hasCourseInstance: {
                  '@type': 'CourseInstance',
                  courseMode: 'Onsite',
                  startDate: event.startDate,
                  endDate: event.endDate || undefined,
                  location: place ? { '@type': 'Place', name: place, address: settings.city || undefined } : undefined,
                },
              }
            : {
                '@type': 'SportsEvent',
                name: event.title,
                description: event.summary,
                startDate: event.startDate,
                endDate: event.endDate || event.startDate,
                eventStatus: 'https://schema.org/EventScheduled',
                eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                organizer: { '@id': `${origin}/#organization` },
                image: isMedia(event.cover) ? absoluteUrl(settings, event.cover.url ?? '') : undefined,
                location: {
                  '@type': 'Place',
                  name: place || settings.siteName,
                  address: { '@type': 'PostalAddress', streetAddress: branch?.address || place || undefined, addressLocality: settings.city || undefined, addressCountry: 'IQ' },
                },
                url: absoluteUrl(settings, href(locale, path)),
              },
        )}
      />
    </>
  )
}
