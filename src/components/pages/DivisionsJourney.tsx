'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { formatNumber, href, type Locale } from '@/lib/i18n'
import { useScroll, useScrollReady } from '@/lib/scroll'
import { clamp01, phase } from '@/webgl/store'
import { LogoMark, SportIcon } from '../brand/Logo'
import { Arrow, Eyebrow } from '../ui/bits'

export type JourneyItem = {
  slug: string
  title: string
  kicker?: string | null
  summary: string
  icon?: string | null
  highlights: string[]
  branches: string[]
  figure?: { value: number; suffix?: string | null; label?: string | null } | null
}

type Intro = { eyebrow?: string | null; title: string; intro?: string | null }
type Labels = { explore: string; availableAt: string; hint: string; lane: string; book: string; bookHref: string; start: string; finish: string }

/**
 * The divisions as one continuous 3D journey.
 *
 * The page is a column of full-height stops — the brand mark first, then one
 * stop per sport. Scrolling flies the camera of the JourneyCanvas (mounted by
 * the layout behind the page) from station to station: each stop is staged
 * with that sport's own Three.js scene (the padel surface, the barbell, the
 * water, the court, the ball…) and its copy rises in over it. A side rail lists
 * the stops and jumps between them; a finish line closes the route with the
 * index of all divisions and a booking call-to-action.
 *
 * Only transforms and class toggles here — no pinning — so it is safe with
 * React navigation and behaves the same on phones.
 */
export function DivisionsJourney({ items, intro, locale, labels }: { items: JourneyItem[]; intro: Intro; locale: Locale; labels: Labels }) {
  const root = useRef<HTMLElement>(null)
  const rail = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const ready = useScrollReady()
  const { scrollTo } = useScroll()
  const stops = items.length + 1 // intro + sports

  useEffect(() => {
    const el = root.current
    if (!el || !ready) return
    gsap.registerPlugin(ScrollTrigger)
    const sections = Array.from(el.querySelectorAll<HTMLElement>('[data-stop]'))
    const canvasRoot = () => document.querySelector<HTMLElement>('.webgl-root')

    const ctx = gsap.context(() => {
      // Route progress → fractional station index for the camera, and the
      // brand mark's own choreography for the intro (it reads phase.hero).
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const j = clamp01(self.progress) * (stops - 1)
          phase.journey = j
          phase.hero = clamp01(j)
          phase.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500)
        },
        onLeave: () => {
          phase.journey = stops - 1
        },
        onLeaveBack: () => {
          phase.journey = 0
          phase.hero = 0
        },
      })

      // Canvas dims once the route is over so the finish line and footer read cleanly.
      ScrollTrigger.create({
        trigger: el,
        start: 'bottom 90%',
        end: 'bottom 30%',
        onUpdate: (self) => {
          const c = canvasRoot()
          if (c) c.style.opacity = String(1 - self.progress * 0.85)
        },
      })

      // The side rail exists only while the route is on screen.
      if (rail.current) {
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', toggleClass: { targets: rail.current, className: 'is-visible' } })
      }

      // Each stop's copy rises in as it takes the screen.
      sections.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 60%',
          end: 'bottom 40%',
          onToggle: (self) => {
            section.classList.toggle('is-active', self.isActive)
            if (self.isActive) setActive(i)
          },
          onEnter: () => section.classList.add('is-seen'),
        })
      })
    }, el)

    // Velocity decays on its own so the shaders relax when scrolling stops.
    const decay = () => {
      phase.velocity *= 0.93
    }
    gsap.ticker.add(decay)

    phase.journey = 0
    ScrollTrigger.refresh()
    return () => {
      gsap.ticker.remove(decay)
      ctx.revert()
      phase.journey = -1
      phase.hero = 0
      const c = canvasRoot()
      if (c) c.style.opacity = ''
    }
  }, [ready, stops])

  const jump = (i: number) => {
    const el = root.current
    if (!el) return
    // Every stop is one viewport tall, so stop i starts i viewports below the route's top.
    const top = el.getBoundingClientRect().top + window.scrollY
    scrollTo(top + i * window.innerHeight + 1)
  }

  return (
    <>
      <section ref={root} id="divisions-journey" className="journey relative" aria-label={labels.lane}>
        {/* Side rail: the stops of the route. */}
        <nav ref={rail} className="journey-rail pointer-events-none fixed inset-y-0 end-4 z-40 hidden flex-col items-center justify-center gap-1 lg:flex" aria-label={labels.lane}>
          <span className="mb-3 h-16 w-px bg-gradient-to-b from-transparent to-white/30" aria-hidden="true" />
          <button
            type="button"
            onClick={() => jump(0)}
            aria-label={intro.title}
            aria-current={active === 0 ? 'step' : undefined}
            className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${active === 0 ? 'border-green bg-green text-ink shadow-[0_0_24px_rgba(0,255,0,0.45)]' : 'border-white/20 text-n-400 hover:border-green hover:text-green'}`}
          >
            <LogoMark className="h-3.5 w-auto" />
          </button>
          {items.map((it, i) => {
            const k = i + 1
            return (
              <button
                key={it.slug}
                type="button"
                onClick={() => jump(k)}
                aria-label={`${String(k).padStart(2, '0')} — ${it.title}`}
                aria-current={active === k ? 'step' : undefined}
                className={`pointer-events-auto group relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${active === k ? 'border-green bg-green text-ink shadow-[0_0_24px_rgba(0,255,0,0.45)]' : k < active ? 'border-green/60 text-green' : 'border-white/20 text-n-400 hover:border-green hover:text-green'}`}
              >
                <SportIcon name={it.icon} className="h-4 w-4" />
                <span className="pointer-events-none absolute end-full me-3 whitespace-nowrap rounded-full bg-ink/85 px-3 py-1 text-xs text-paper opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {it.title}
                </span>
              </button>
            )
          })}
          <span className="mt-3 h-16 w-px bg-gradient-to-t from-transparent to-white/30" aria-hidden="true" />
        </nav>

        {/* Stop 0 — the mark. */}
        <header data-stop className="journey-stop relative flex h-[100svh] items-end">
          <div className="shell relative w-full pb-[clamp(2rem,8vh,5rem)] pt-32">
            <div className="max-w-3xl">
              <Eyebrow className="journey-item">{intro.eyebrow}</Eyebrow>
              <h1 className="journey-title mt-5 text-[clamp(2.6rem,7vw,6.5rem)] text-paper">{intro.title}</h1>
              {intro.intro && (
                <p className="journey-item mt-6 max-w-[58ch] text-base leading-[1.8] text-n-300 sm:text-lg" style={{ '--i': 2 } as React.CSSProperties}>
                  {intro.intro}
                </p>
              )}
              <div className="journey-item mt-10 flex flex-wrap items-center gap-6" style={{ '--i': 3 } as React.CSSProperties}>
                <span className="inline-flex items-center gap-3 text-sm text-n-400">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-green/50">
                    <span className="u-scroll-dot block h-2 w-2 rounded-full bg-green" />
                  </span>
                  {labels.hint}
                </span>
                <span className="u-mono text-xs text-green">
                  <bdi dir="ltr">
                    {labels.start} · {String(items.length).padStart(2, '0')}
                  </bdi>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Stops 1…n — one per sport, staged by its own 3D scene behind. */}
        <ol role="list">
          {items.map((it, i) => {
            const k = i + 1
            return (
              <li key={it.slug} data-stop id={`division-${it.slug}`} className="journey-stop relative flex h-[100svh] items-end">
                {/* Scrim under the copy: the scenes are bright and busy; the type sits on black. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink via-ink/70 to-transparent" aria-hidden="true" />
                {/* Giant stop number, outlined until active. */}
                <span className="journey-num u-mono pointer-events-none absolute end-[calc(var(--shell)+2.5rem)] top-[clamp(5rem,12vh,8rem)] select-none text-[clamp(5rem,16vw,14rem)] leading-none" aria-hidden="true">
                  {String(k).padStart(2, '0')}
                </span>

                <article className="shell relative w-full pb-[clamp(2rem,7vh,5rem)] pt-28">
                  <div className="max-w-[62ch]">
                    <div className="journey-item flex items-center gap-4" style={{ '--i': 0 } as React.CSSProperties}>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-green/50 text-green">
                        <SportIcon name={it.icon} className="h-5 w-5" />
                      </span>
                      <bdi dir="ltr" className="u-mono text-[0.7rem] text-green">
                        {String(k).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                      </bdi>
                      {it.kicker && <span className="text-sm text-n-300">— {it.kicker}</span>}
                    </div>

                    <h2 className="journey-title mt-5 text-[clamp(2.75rem,7.5vw,7rem)] text-paper">{it.title}</h2>

                    <p className="journey-item mt-5 max-w-[56ch] text-base leading-[1.8] text-n-200 sm:text-lg" style={{ '--i': 2 } as React.CSSProperties}>
                      {it.summary}
                    </p>

                    {it.highlights.length > 0 && (
                      <ul className="journey-item mt-6 flex flex-wrap gap-2" style={{ '--i': 3 } as React.CSSProperties}>
                        {it.highlights.map((h) => (
                          <li key={h} className="rounded-full border border-green/50 bg-ink/40 px-3.5 py-1.5 text-sm text-green backdrop-blur">
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="journey-item mt-8 flex flex-wrap items-end gap-x-12 gap-y-6" style={{ '--i': 4 } as React.CSSProperties}>
                      {it.figure?.value ? <Figure value={it.figure.value} suffix={it.figure.suffix} label={it.figure.label} locale={locale} active={active === k} /> : null}
                      {it.branches.length > 0 && (
                        <div>
                          <p className="text-xs text-n-400">{labels.availableAt}</p>
                          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            {it.branches.map((b) => (
                              <li key={b} className="text-sm text-paper">
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Link href={href(locale, `/divisions/${it.slug}`)} className="journey-item u-btn u-btn-primary mt-9" style={{ '--i': 5 } as React.CSSProperties}>
                      {labels.explore}
                      <Arrow />
                    </Link>
                  </div>
                </article>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Finish line. */}
      <div className="journey-finish relative z-[2] border-t u-hairline bg-ink">
        <div className="journey-checker h-3 w-full" aria-hidden="true" />
        <div className="shell flex flex-col gap-8 py-[clamp(3rem,8vh,5rem)]">
          <div className="flex items-center gap-5 text-xs text-n-400" aria-hidden="true">
            <span className="u-mono text-green">{labels.finish}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-green/70 to-transparent rtl:bg-gradient-to-l" />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <ul className="flex flex-wrap gap-3" role="list">
              {items.map((it, i) => (
                <li key={it.slug}>
                  <Link
                    href={href(locale, `/divisions/${it.slug}`)}
                    className="inline-flex items-center gap-3 rounded-full border border-white/15 px-5 py-2.5 text-sm text-n-200 transition-colors hover:border-green hover:text-green"
                  >
                    <bdi dir="ltr" className="u-mono text-[0.65rem] text-green">
                      {String(i + 1).padStart(2, '0')}
                    </bdi>
                    <SportIcon name={it.icon} className="h-4 w-4" />
                    {it.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={labels.bookHref} className="u-btn u-btn-primary self-start lg:self-auto">
              {labels.book}
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

/** Headline figure that counts up each time its stop becomes active. */
function Figure({ value, suffix, label, locale, active }: { value: number; suffix?: string | null; label?: string | null; locale: Locale; active: boolean }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }
    let raf = 0
    let start = 0
    const run = (now: number) => {
      if (!start) start = now
      const p = Math.min(1, (now - start) / 1400)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setShown(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [active, value])

  return (
    <div>
      <span className="block text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-green tabular-nums">
        <bdi dir="ltr">
          {formatNumber(locale, active ? shown : value)}
          {suffix ?? ''}
        </bdi>
      </span>
      {label && <p className="mt-1 text-sm text-n-300">{label}</p>}
    </div>
  )
}
