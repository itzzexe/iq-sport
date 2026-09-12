import type { Metadata } from 'next'
import { LogoMark } from '@/components/brand/Logo'
import { Parallax } from '@/components/motion/Parallax'
import { VisionStatement } from '@/components/pages/VisionStatement'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { BackHome, Eyebrow, Index, JsonLd, PageHero } from '@/components/ui/bits'
import { getGlobal, getSettings } from '@/lib/cms'
import { makeT } from '@/lib/labels'
import { resolveLocale, type LangParams } from '@/lib/params'
import { breadcrumbLd, buildMetadata, graph, webPageLd } from '@/lib/seo'

const PATH = '/vision'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('vision-page', locale, 1)])
  return buildMetadata({ settings, locale, path: PATH, title: page.title, description: page.statement, meta: page.meta, image: page.image })
}

export default async function VisionPage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('vision-page', locale, 1)])
  const t = makeT(settings, locale)
  const values = page.values ?? []

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro || null} image={page.image} />

      <Reveal className="shell py-[clamp(4rem,10vh,8rem)]">
        <div className="flex items-start gap-5">
          <LogoMark className="mt-2 w-12 shrink-0 text-green" />
          <VisionStatement text={page.statement} className="max-w-[26ch] text-[clamp(1.75rem,4.6vw,3.9rem)] leading-[1.35] text-paper" />
        </div>
        {page.mission && (
          <p className="js-reveal mt-12 max-w-[60ch] text-lg leading-[1.85] text-n-300" style={{ '--i': 1 } as React.CSSProperties}>
            {page.mission}
          </p>
        )}
      </Reveal>

      {values.length > 0 && (
        <Reveal className="shell pb-[clamp(4rem,10vh,8rem)]">
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {values.map((v, i) => (
              <li key={v.id ?? i} className="js-reveal u-card flex min-h-[12rem] flex-col justify-between gap-6 p-6" style={{ '--i': i } as React.CSSProperties}>
                <Index n={i + 1} />
                <div>
                  <h2 className="text-2xl text-paper">{v.title}</h2>
                  {v.body && <p className="mt-2 text-sm leading-relaxed text-n-400">{v.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {page.image && (
        <div className="shell pb-[clamp(4rem,10vh,8rem)]">
          <div className="relative aspect-[21/9] overflow-hidden rounded-[var(--radius-card)]">
            <Parallax amount={8}>
              <Media media={page.image} size="hero" fill sizes="(min-width: 1280px) 1200px, 92vw" imgClassName="scale-110" />
            </Parallax>
          </div>
        </div>
      )}

      <BackHome locale={locale} t={t} />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, PATH, page.title, page.statement),
          breadcrumbLd(settings, locale, [{ name: settings.siteName, path: '/' }, { name: page.title, path: PATH }]),
        )}
      />
    </>
  )
}
