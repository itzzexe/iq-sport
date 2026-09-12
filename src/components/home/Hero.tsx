import Link from 'next/link'
import type { Home } from '@/payload-types'
import { pageHref, type Locale } from '@/lib/i18n'
import type { T } from '@/lib/labels'
import { LogoMark } from '../brand/Logo'
import { HeroPhase } from '../motion/HeroPhase'
import { Media } from '../ui/Media'
import { Arrow } from '../ui/bits'

/**
 * First frame of the film. The 3D mark (Ribbons in the brand scene) stages
 * itself in the free column opposite this copy; the background image sits
 * *behind* the canvas so the ribbons flow over the venue, and the copy block
 * is parallaxed away by <HeroPhase /> as the reader scrolls on.
 */
export function Hero({ hero, locale, t, tagline }: { hero: Home['hero']; locale: Locale; t: T; tagline?: string | null }) {
  const primary = hero.primaryCta?.label ? hero.primaryCta : null
  const secondary = hero.secondaryCta?.label ? hero.secondaryCta : null
  const lines = splitHeadline(hero.title)

  return (
    <section className="relative flex min-h-[100svh] w-full items-end overflow-hidden">
      <HeroPhase />

      {/* Behind the WebGL canvas (negative z in the root stacking context). */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Media
          media={hero.background}
          size="hero"
          fill
          sizes="100vw"
          priority
          fallbackSrc="/img/aerial-complex.jpg"
          imgClassName="scale-105 opacity-70"
        />
        {/* graded scrim: dark under the copy, lighter up top so the venue stays visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/45 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_10%,rgba(0,0,0,0.55)_70%,#000_100%)]" />
      </div>

      <div className="shell relative w-full pb-[clamp(1.5rem,5vh,4rem)] pt-32">
        <div data-hero-copy className="flex flex-col gap-[clamp(1rem,2.5vh,1.75rem)]">
          {tagline && (
            <div className="flex items-center gap-4">
              <LogoMark className="w-10 shrink-0 text-green" />
              <span className="text-sm text-n-300 sm:text-base">{tagline}</span>
            </div>
          )}

          {/* Sized against viewport height as well as width: three lines of
              Arabic at 1.3 leading is ~4× the font size, so a width-only clamp
              pushes the last line off the bottom on a short laptop. */}
          <h1 className="max-w-[16ch] text-[clamp(2.6rem,min(8.5vw,13vh),7.5rem)] text-paper">
            {lines.map((line, i) => (
              <span key={i} className="js-split-line" style={{ '--i': i } as React.CSSProperties}>
                <span className={i === 1 ? 'text-green' : undefined}>{line}</span>
              </span>
            ))}
          </h1>

          {hero.subtitle && <p className="max-w-[52ch] text-base leading-[1.8] text-n-200 sm:text-lg">{hero.subtitle}</p>}

          {(primary || secondary) && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {primary && (
                <Link href={pageHref(locale, primary.target)} className="u-btn u-btn-primary">
                  {primary.label}
                  <Arrow />
                </Link>
              )}
              {secondary && (
                <Link href={pageHref(locale, secondary.target)} className="u-btn u-btn-ghost">
                  {secondary.label}
                </Link>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-6">
            <a href="#about" className="group inline-flex items-center gap-3 text-sm text-n-400 transition-colors hover:text-green">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-green/50">
                <span className="u-scroll-dot block h-2 w-2 rounded-full bg-green" />
              </span>
              {t('scrollHint')}
            </a>
            <span className="u-mono hidden text-[0.6rem] text-n-600 sm:block">
              <bdi dir="ltr">33.3°N 44.4°E</bdi>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Breaks the headline into up to three lines so each can rise from its own
 * clip mask. Editors write one line; the split happens on word boundaries.
 */
function splitHeadline(title: string): string[] {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return [title]
  if (words.length === 2) return words
  const per = Math.ceil(words.length / 3)
  const lines = [words.slice(0, per), words.slice(per, per * 2), words.slice(per * 2)].filter((w) => w.length > 0)
  return lines.map((w) => w.join(' '))
}
