import Link from 'next/link'
import type { Division } from '@/payload-types'
import { href, type Locale } from '@/lib/i18n'
import type { T } from '@/lib/labels'
import { SportIcon } from '../brand/Logo'
import { HeroPhase } from '../motion/HeroPhase'
import { Arrow, Eyebrow } from '../ui/bits'

/**
 * Opening act of a division page. The sport's own WebGL scene (padel balls,
 * gym bar, water, court, football, basketball) is mounted by the layout
 * (<SiteScene />) behind this copy and is dimmed to ambience once the reader
 * scrolls past — see <HeroPhase />.
 */
export function DivisionHero({ division, index, total, locale, t }: { division: Division; index: number; total: number; locale: Locale; t: T }) {
  const number = String(index + 1).padStart(2, '0')
  const highlights = division.highlights ?? []

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <HeroPhase dimCanvas />

      {/* Scrim under the copy block. The scenes are deliberately bright and
          busy; the type has to sit on black regardless of what the shader is
          doing behind it at that moment. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink via-ink/75 to-transparent" />

      <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-[clamp(1.5rem,5vh,4rem)] pt-28">
        {/* The sport icon, blown up and faint, anchors the composition. */}
        <SportIcon name={division.icon} className="pointer-events-none absolute end-[var(--shell)] top-24 h-[clamp(6rem,18vw,15rem)] w-auto text-green/10" />

        <div data-hero-copy className="flex flex-col gap-[clamp(1rem,2.5vh,2rem)]">
          <div className="flex items-center gap-4">
            <SportIcon name={division.icon} className="h-8 w-8 shrink-0 text-green" />
            <Eyebrow>
              <bdi dir="ltr" className="u-mono">
                {number} / {String(total).padStart(2, '0')}
              </bdi>
            </Eyebrow>
          </div>

          <h1 className="max-w-[14ch] text-[clamp(2.75rem,min(9vw,15vh),7.5rem)] text-paper">
            <span className="js-split-line">
              <span>{division.title}</span>
            </span>
          </h1>

          <p className="max-w-[54ch] text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.8] text-n-300">{division.lede || division.summary}</p>

          {highlights.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {highlights.map((h) => (
                <li key={h.id ?? h.label} className="text-sm text-green">
                  {h.label}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <span className="text-sm text-n-500">{division.kicker}</span>
            {division.bookable !== false && (
              <Link href={`${href(locale, '/')}?activity=${division.slug}#contact`} className="u-btn u-btn-primary">
                {t('bookThis')}
                <Arrow />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
