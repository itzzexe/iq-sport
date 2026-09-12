import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Branch, Coach } from '@/payload-types'
import { SportIcon } from '@/components/brand/Logo'
import { Parallax } from '@/components/motion/Parallax'
import { CoachCard } from '@/components/pages/cards'
import { DivisionHero } from '@/components/pages/DivisionHero'
import { StatCard } from '@/components/pages/StatCard'
import { Reveal } from '@/components/ui/Reveal'
import { Media } from '@/components/ui/Media'
import { BackHome, Eyebrow, Index, JsonLd } from '@/components/ui/bits'
import { getCoachesOfDivision, getDivision, getDivisions, getSettings, publishedSlugs } from '@/lib/cms'
import { href, LOCALES } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { resolveLocale, type SlugParams } from '@/lib/params'
import { absoluteUrl, breadcrumbLd, buildMetadata, graph, siteOrigin, webPageLd } from '@/lib/seo'

export async function generateStaticParams() {
  const slugs = await publishedSlugs('divisions')
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const { slug } = await params
  const [settings, division] = await Promise.all([getSettings(locale), getDivision(slug, locale)])
  if (!division) return {}
  return buildMetadata({
    settings,
    locale,
    path: `/divisions/${division.slug}`,
    title: division.title,
    description: division.lede || division.summary,
    meta: division.meta,
    image: division.image,
  })
}

export default async function DivisionPage({ params }: { params: SlugParams }) {
  const locale = await resolveLocale(params)
  const { slug } = await params
  const [settings, division, all] = await Promise.all([getSettings(locale), getDivision(slug, locale), getDivisions(locale, 0)])
  if (!division) notFound()
  const t = makeT(settings, locale)

  const branches = (division.branches ?? []).filter((b): b is Branch => typeof b === 'object')
  // Editors can link a coach from either side (division → coaches, or coach → division); show the union.
  const linked = (division.coaches ?? []).filter((c): c is Coach => typeof c === 'object')
  const byDivision = await getCoachesOfDivision(division.id, locale)
  const coaches = [...linked, ...byDivision.filter((c) => !linked.some((l) => l.id === c.id))]
  const others = all.filter((d) => d.id !== division.id)
  const path = `/divisions/${division.slug}`
  const figure = division.figure?.value ? division.figure : null

  return (
    <>
      <DivisionHero division={division} index={all.findIndex((d) => d.id === division.id)} total={all.length} locale={locale} t={t} />

      <Reveal className="shell grid gap-[clamp(2.5rem,6vw,5rem)] py-[clamp(3rem,8vh,6rem)] lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          {(division.story ?? []).map((p, i) => (
            <p key={p.id ?? i} className="js-reveal max-w-[64ch] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-[1.85] text-n-300" style={{ '--i': i } as React.CSSProperties}>
              {p.text}
            </p>
          ))}
        </div>
        <aside className="flex flex-col gap-8 lg:col-span-5">
          {figure && (
            <div className="u-card px-6">
              <StatCard value={figure.value!} suffix={figure.suffix} label={figure.label ?? ''} index={0} locale={locale} />
            </div>
          )}
          {branches.length > 0 && (
            <div className="js-reveal">
              <h2 className="text-sm text-n-500">{t('availableAt')}</h2>
              <ul className="mt-3 flex flex-col divide-y divide-white/10 border-y border-white/10">
                {branches.map((b, i) => (
                  <li key={b.id} className="flex items-center gap-4 py-3">
                    <Index n={i + 1} />
                    <Link href={href(locale, '/branches')} className="text-lg text-paper transition-colors hover:text-green">
                      {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </Reveal>

      {(division.features ?? []).length > 0 && (
        <Reveal className="shell pb-[clamp(3rem,8vh,6rem)]">
          <Eyebrow>{t('features')}</Eyebrow>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {division.features!.map((f, i) => (
              <li key={f.id ?? i} className="js-reveal group flex min-h-[11rem] flex-col justify-between gap-5 bg-ink p-6 transition-colors hover:bg-n-900" style={{ '--i': i } as React.CSSProperties}>
                <Index n={i + 1} />
                <div>
                  <h2 className="text-xl text-paper">{f.title}</h2>
                  {f.body && <p className="mt-2 text-sm leading-relaxed text-n-400">{f.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {division.image && (
        <section className="relative overflow-hidden" aria-hidden="true">
          <div className="relative aspect-[16/9] max-h-[85svh] w-full sm:aspect-[21/9]">
            <Parallax amount={8}>
              <Media media={division.image} size="hero" fill sizes="100vw" imgClassName="scale-110" />
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
            <div className="shell absolute inset-x-0 bottom-0 flex items-end justify-between pb-8 text-sm">
              <span className="text-paper/80">{division.title}</span>
              <span className="text-green">{settings.city}</span>
            </div>
          </div>
        </section>
      )}

      {coaches.length > 0 && (
        <Reveal className="shell py-[clamp(3rem,8vh,6rem)]">
          <Eyebrow>{t('coaches')}</Eyebrow>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {coaches.map((c, i) => (
              <li key={c.id}>
                <CoachCard coach={c} index={i} t={t} locale={locale} />
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {others.length > 0 && (
        <Reveal className="shell border-t u-hairline py-[clamp(3rem,8vh,5rem)]">
          <Eyebrow>{t('otherDivisions')}</Eyebrow>
          <ul className="mt-6 flex flex-wrap gap-3" role="list">
            {others.map((d) => (
              <li key={d.id}>
                <Link href={href(locale, `/divisions/${d.slug}`)} className="inline-flex items-center gap-3 rounded-full border border-white/15 px-5 py-2.5 text-sm text-n-200 transition-colors hover:border-green hover:text-green">
                  <SportIcon name={d.icon} className="h-4 w-4" />
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <BackHome
        locale={locale}
        t={t}
        extra={
          <Link href={href(locale, '/divisions')} className="text-sm text-n-400 transition-colors hover:text-green">
            {t('viewAll')}
          </Link>
        }
      />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, path, division.title, division.lede || division.summary),
          breadcrumbLd(settings, locale, [
            { name: settings.siteName, path: '/' },
            { name: t('division'), path: '/divisions' },
            { name: division.title, path },
          ]),
          {
            '@type': 'Service',
            name: division.title,
            description: division.summary,
            provider: { '@id': `${siteOrigin(settings)}/#organization` },
            areaServed: settings.city || undefined,
            image: typeof division.image === 'object' ? absoluteUrl(settings, division.image.url ?? '') : undefined,
          },
        )}
      />
    </>
  )
}
