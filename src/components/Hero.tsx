'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/lib/lang'
import { useScroll } from '@/lib/scroll'
import { clamp01, phase } from '@/webgl/store'
import { CONCEPT_WORDS, SITE, UI } from '@/data/site'
import { BackgroundVideo, LogoMark } from './primitives'

/**
 * The hero owns two jobs: it is the first frame of the film, and it is the
 * section that publishes `phase.hero` and `phase.velocity` to the WebGL store.
 * Everything the canvas does through the opening act is driven from here.
 */
export function Hero() {
  const { t, lang } = useLang()
  const { scrollTo } = useScroll()
  const root = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Publish hero progress + a smoothed scroll velocity to the 3D layer.
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          phase.hero = clamp01(self.progress)
          // getVelocity() is px/s; 2500 maps a brisk flick to roughly 1.
          phase.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500)
        },
      })

      // Page-wide progress, used by the particle field and the footer meter.
      const page = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          phase.page = self.progress
        },
      })

      // Velocity decays on its own so the shaders relax when scrolling stops.
      const decay = () => {
        phase.velocity *= 0.93
      }
      gsap.ticker.add(decay)

      // Copy parallaxes up and dissolves as the hero leaves.
      gsap.to('[data-hero-copy]', {
        yPercent: -28,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })

      return () => {
        trigger.kill()
        page.kill()
        gsap.ticker.remove(decay)
      }
    }, el)

    return () => ctx.revert()
  }, [])

  // Entrance: the headline rises once the preloader has cleared.
  useEffect(() => {
    const node = title.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => node.classList.add('is-revealed'), reduced ? 0 : 1150)
    return () => window.clearTimeout(timer)
  }, [])

  const headline =
    lang === 'ar'
      ? ['نبني', 'الرياضة', 'في العراق']
      : ['We build', 'sport', 'in Iraq']

  return (
    <div ref={root} id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Real aerial footage of the complex, rendered from the company profile.
          The scrim is graded rather than flat: dark enough under the copy block
          at the bottom to hold AA contrast, light enough up top that the venue
          is unmistakably visible. */}
      <div className="absolute inset-0 -z-10">
        <BackgroundVideo name="hero-aerial" className="scale-105 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/45 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_10%,rgba(0,0,0,0.55)_70%,var(--color-ink)_100%)]" />
      </div>

      <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-[clamp(1.5rem,5vh,4rem)] pt-28">
        <div data-hero-copy className="flex flex-col gap-[clamp(1rem,2.5vh,2rem)]">
          <div className="flex items-center gap-4">
            <LogoMark className="w-10 shrink-0 text-green" />
            <span className="u-mono text-[0.6rem] text-n-400 sm:text-[0.7rem]">
              {t(SITE.tagline)} — {t(UI.established)}
            </span>
          </div>

          {/* Sized against viewport *height* as well as width: three lines of
              Arabic at 1.32 leading is ~4 x the font size, so a width-only
              clamp pushes the last line off the bottom on a short laptop. */}
          <h1
            ref={title}
            className="u-display max-w-[16ch] text-[clamp(2.5rem,min(8.5vw,14vh),7rem)] text-paper"
          >
            {headline.map((line, i) => (
              <span key={i} className="js-split-line" style={{ '--i': i } as React.CSSProperties}>
                <span className={i === 1 ? 'text-green' : undefined}>{line}</span>
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[46ch] text-balance text-sm leading-relaxed text-n-300 sm:text-base">
              {t(SITE.concept)}
            </p>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {CONCEPT_WORDS.map((word) => (
                <li key={word.en} className="u-mono text-[0.6rem] text-n-500">
                  {t(word)}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              onClick={() => scrollTo('#about')}
              className="group flex items-center gap-3 text-start"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-green/50">
                <span className="block h-2 w-2 animate-bounce rounded-full bg-green" />
              </span>
              <span className="u-mono text-[0.6rem] text-n-400 transition-colors group-hover:text-green">
                {t(UI.scroll)}
              </span>
            </button>

            <span className="u-mono hidden text-[0.6rem] text-n-600 sm:block">
              {t(SITE.city)} — 33.3°N 44.4°E
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
