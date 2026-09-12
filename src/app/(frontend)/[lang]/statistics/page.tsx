import type { Metadata } from 'next'
import { LogoMark } from '@/components/brand/Logo'
import { StatCard } from '@/components/pages/StatCard'
import { Reveal } from '@/components/ui/Reveal'
import { BackHome, Eyebrow, Index, JsonLd, PageHero } from '@/components/ui/bits'
import { getGlobal, getSettings } from '@/lib/cms'
import { makeT } from '@/lib/labels'
import { resolveLocale, type LangParams } from '@/lib/params'
import { breadcrumbLd, buildMetadata, graph, webPageLd } from '@/lib/seo'

const PATH = '/statistics'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('statistics-page', locale, 1)])
  return buildMetadata({ settings, locale, path: PATH, title: page.title, description: page.intro, meta: page.meta })
}

export default async function StatisticsPage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('statistics-page', locale, 1)])
  const t = makeT(settings, locale)
  const stats = page.stats ?? []
  const reasons = page.reasons ?? []
  const rush = page.rushHours?.value ? page.rushHours : null

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
        {rush && (
          <p className="mt-8 flex items-baseline gap-3">
            <span className="text-sm text-n-500">{rush.label || t('rushHours')}</span>
            <bdi dir="ltr" className="u-mono text-lg text-green">
              {rush.value}
            </bdi>
          </p>
        )}
      </PageHero>

      {stats.length > 0 && (
        <Reveal className="shell grid gap-x-10 py-[clamp(3rem,8vh,6rem)] sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <StatCard key={s.id ?? i} value={s.value} suffix={s.suffix} label={s.label} index={i} locale={locale} />
          ))}
        </Reveal>
      )}

      {reasons.length > 0 && (
        <Reveal className="shell pb-[clamp(4rem,10vh,8rem)]">
          <Eyebrow>{page.whyEyebrow}</Eyebrow>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {reasons.map((r, i) => (
              <li key={r.id ?? i} className="js-reveal group relative flex min-h-[13rem] flex-col justify-between gap-6 bg-ink p-6 transition-colors duration-500 hover:bg-n-900 sm:p-8" style={{ '--i': i } as React.CSSProperties}>
                <Index n={i + 1} />
                <div>
                  <h2 className="text-xl text-paper sm:text-2xl">{r.title}</h2>
                  {r.body && <p className="mt-2 text-sm leading-relaxed text-n-400">{r.body}</p>}
                </div>
              </li>
            ))}
            {page.closing?.title && (
              <li className="js-reveal flex min-h-[13rem] flex-col justify-between gap-6 bg-green p-6 text-ink sm:p-8" style={{ '--i': reasons.length } as React.CSSProperties}>
                <LogoMark className="w-10 text-ink" />
                <div>
                  <h2 className="text-xl sm:text-2xl">{page.closing.title}</h2>
                  {page.closing.body && <p className="mt-2 text-sm leading-relaxed text-ink/75">{page.closing.body}</p>}
                </div>
              </li>
            )}
          </ul>
        </Reveal>
      )}

      <BackHome locale={locale} t={t} />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, PATH, page.title, page.intro),
          breadcrumbLd(settings, locale, [{ name: settings.siteName, path: '/' }, { name: page.title, path: PATH }]),
        )}
      />
    </>
  )
}
