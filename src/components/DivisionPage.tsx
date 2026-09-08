'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/lib/lang'
import { useCountUp } from '@/lib/hooks'
import { clamp01, phase } from '@/webgl/store'
import { BRANCHES, DIVISIONS, TEAM, UI, type Division } from '@/data/site'
import { DIVISION_ORDER, DIVISION_PAGES } from '@/data/pages'
import { Preloader } from './Preloader'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { BackgroundVideo, Eyebrow, Picture, Reveal, SportIcon } from './primitives'

const DivisionCanvas = dynamic(() => import('@/webgl/DivisionCanvas'), { ssr: false })

/**
 * One page per division. The layout is shared; the WebGL scene behind it is
 * not — each sport gets its own motion piece, chosen by slug in the canvas.
 */
export function DivisionPage({ slug }: { slug: string }) {
  const division = DIVISIONS.find((d) => d.slug === slug) ?? DIVISIONS[0]
  const page = DIVISION_PAGES[division.slug]
  const { t, lang } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)

  const index = DIVISION_ORDER.indexOf(division.slug)
  const prev = DIVISIONS[(index - 1 + DIVISIONS.length) % DIVISIONS.length]
  const next = DIVISIONS[(index + 1) % DIVISIONS.length]

  // Publishes hero + page progress so the scene can stage itself.
  useEffect(() => {
    const heroEl = hero.current
    if (!heroEl) return
    gsap.registerPlugin(ScrollTrigger)

    // Fresh page: start from zero so the scene does not inherit the home
    // page's end state through the shared store.
    phase.hero = 0
    phase.page = 0
    phase.divisions = 0
    phase.velocity = 0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          phase.hero = clamp01(self.progress)
          phase.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500)
          // Past the hero the scene becomes ambience: it stays alive behind
          // the copy but drops to a third so paragraphs read over it.
          const canvasRoot = document.querySelector<HTMLElement>('.webgl-root')
          if (canvasRoot) canvasRoot.style.opacity = String(1 - phase.hero * 0.68)
        },
      })
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          phase.page = self.progress
        },
      })
      gsap.to('[data-division-copy]', {
        yPercent: -22,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
      gsap.fromTo(
        '[data-division-media]',
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '[data-division-media-wrap]', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, root)

    const decay = () => {
      phase.velocity *= 0.93
    }
    gsap.ticker.add(decay)

    ScrollTrigger.refresh()
    return () => {
      gsap.ticker.remove(decay)
      ctx.revert()
    }
  }, [slug])

  useEffect(() => {
    const el = hero.current?.querySelector('h1')
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => el.classList.add('is-revealed'), reduced ? 0 : 900)
    return () => window.clearTimeout(timer)
  }, [slug])

  const branches = BRANCHES.filter((b) => page.branches.includes(b.slug))
  const coaches = TEAM.filter((p) => page.coaches?.includes(p.slug))
  const number = String(index + 1).padStart(2, '0')

  return (
    <div ref={root}>
      <a
        href="#story"
        className="u-mono fixed start-4 top-4 z-[200] -translate-y-24 rounded-full bg-green px-5 py-3 text-[0.65rem] text-ink transition-transform focus-visible:translate-y-0"
      >
        {t(UI.skip)}
      </a>

      <Preloader />
      <DivisionCanvas slug={division.slug} />
      <Nav />

      <main className="relative">
        {/* ------------------------------------------------------------ hero */}
        <section ref={hero} className="relative min-h-[100svh] overflow-hidden">
          {/* Scrim under the copy block. The scenes are deliberately bright and
              busy; the type has to sit on black regardless of what the shader
              is doing behind it at that moment. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink via-ink/75 to-transparent" />

          <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-[clamp(1.5rem,5vh,4rem)] pt-28">
            {/* The sport icon, blown up and faint, anchors the composition. */}
            <SportIcon
              name={division.icon}
              className="pointer-events-none absolute end-[var(--shell)] top-24 h-[clamp(6rem,18vw,15rem)] w-auto text-green/10"
            />

            <div data-division-copy className="flex flex-col gap-[clamp(1rem,2.5vh,2rem)]">
              <div className="flex items-center gap-4">
                <SportIcon name={division.icon} className="h-8 w-8 shrink-0 text-green" />
                <Eyebrow label={{ ar: 'أقسام المجموعة', en: 'Divisions' }} index={`${number} / 06`} />
              </div>

              <h1 className="u-display max-w-[14ch] text-[clamp(2.75rem,min(9vw,15vh),7.5rem)] text-paper">
                <span className="js-split-line">
                  <span>{t(division.title)}</span>
                </span>
              </h1>

              <p className="max-w-[52ch] text-[clamp(1rem,1.5vw,1.3rem)] leading-relaxed text-n-300">{t(page.lede)}</p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {division.meta.map((m) => (
                  <span key={m.en} className="u-mono text-[0.6rem] text-green">
                    {t(m)}
                  </span>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-6">
                <span className="u-mono text-[0.6rem] text-n-500">{t(division.kicker)}</span>
                <Link
                  href={`/?activity=${division.slug}#contact`}
                  className="u-mono rounded-full bg-green px-5 py-2.5 text-[0.65rem] text-ink transition-transform hover:scale-[1.04]"
                >
                  {t(UI.book)}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- story */}
        <section id="story" className="shell relative py-[clamp(5rem,14vh,10rem)]">
          <div className="grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal className="sticky top-28">
                <Eyebrow label={{ ar: 'القسم', en: 'The division' }} />
                <h2 className="u-display mt-6 text-[clamp(2rem,4.5vw,3.5rem)] text-paper">{t(division.title)}</h2>
                {page.figure && <Figure value={page.figure.value} suffix={page.figure.suffix} label={t(page.figure.label)} />}
              </Reveal>
            </div>
            <Reveal className="flex flex-col gap-6 lg:col-span-8">
              {page.story.map((p, i) => (
                <p
                  key={i}
                  className="js-fade max-w-[62ch] text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.75] text-n-300"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {t(p)}
                </p>
              ))}
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------- features */}
        <section className="shell relative pb-[clamp(5rem,14vh,10rem)]">
          <Reveal>
            <Eyebrow label={{ ar: 'ما الذي يميّزه', en: 'What sets it apart' }} />
            <ul className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {page.features.map((f, i) => (
                <li
                  key={f.title.en}
                  className="js-fade group relative flex min-h-[12rem] flex-col justify-between gap-6 bg-ink p-6 transition-colors duration-500 hover:bg-n-900"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span className="u-mono text-[0.65rem] text-green">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="u-display text-xl text-paper">{t(f.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-n-400">{t(f.body)}</p>
                  </div>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-green transition-transform duration-500 group-hover:scale-x-100" />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* ----------------------------------------------------------- media */}
        <section data-division-media-wrap className="relative overflow-hidden">
          <div className="relative aspect-[16/9] max-h-[85svh] w-full sm:aspect-[21/9]">
            <div data-division-media className="absolute inset-0 scale-110">
              {division.video ? (
                <BackgroundVideo name={division.video} />
              ) : (
                <Picture name={division.image} alt={t(division.title)} className="h-full w-full" sizes="100vw" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
            <div className="shell absolute inset-x-0 bottom-0 flex items-end justify-between pb-8">
              <span className="u-mono text-[0.6rem] text-paper/80">{t(division.title)}</span>
              <span className="u-mono text-[0.6rem] text-green">{lang === 'ar' ? 'بغداد' : 'Baghdad'}</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- where + coaches */}
        {(branches.length > 0 || coaches.length > 0) && (
          <section className="shell relative py-[clamp(5rem,14vh,10rem)]">
            <div className="grid gap-12 lg:grid-cols-2">
              {branches.length > 0 && (
                <Reveal>
                  <Eyebrow label={{ ar: 'أين تجده', en: 'Where to find it' }} />
                  <ul className="mt-6 flex flex-col">
                    {branches.map((b, i) => (
                      <li
                        key={b.slug}
                        className="js-fade flex flex-col gap-2 border-t border-white/10 py-5 last:border-b"
                        style={{ '--i': i } as React.CSSProperties}
                      >
                        <span className="u-display text-2xl text-paper">{t(b.name)}</span>
                        <span className="text-xs text-n-400">{b.facilities.map((f) => t(f)).join(' · ')}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {coaches.length > 0 && (
                <Reveal>
                  <Eyebrow label={{ ar: 'المدرّبون', en: 'Coaches' }} />
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {coaches.map((p, i) => (
                      <li
                        key={p.slug}
                        className="js-fade group relative overflow-hidden border border-white/10"
                        style={{ '--i': i } as React.CSSProperties}
                      >
                        <div className="relative aspect-[3/4]">
                          <Picture
                            name={p.photo}
                            alt={t(p.name)}
                            className="h-full w-full"
                            imgClassName="transition-transform duration-[900ms] group-hover:scale-105"
                            sizes="(min-width: 1024px) 22vw, 46vw"
                          />
                          <div className="absolute inset-0 bg-green/20 mix-blend-color transition-opacity duration-700 group-hover:opacity-0" />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h3 className="u-display text-base text-paper">{t(p.name)}</h3>
                          <p className="u-mono mt-1 text-[0.58rem] text-green">{t(p.role)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------- cta + nav */}
        <section className="shell relative py-[clamp(5rem,14vh,10rem)]">
          <Reveal className="flex flex-col gap-10 border-t border-white/10 pt-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="u-display max-w-[14ch] text-[clamp(2.5rem,7vw,5.5rem)] text-paper">
                {lang === 'ar' ? 'احجز حصّتك' : 'Book your session'}
              </h2>
              <Link
                href={`/?activity=${division.slug}#contact`}
                className="group relative inline-flex w-fit items-center gap-3 overflow-hidden rounded-full bg-green px-7 py-4 text-ink"
              >
                <span className="u-mono relative z-10 text-[0.7rem]">{t(UI.book)}</span>
                <span className="relative z-10 text-lg leading-none transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {lang === 'ar' ? '←' : '→'}
                </span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-volt transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              </Link>
            </div>

            <nav aria-label={lang === 'ar' ? 'الأقسام الأخرى' : 'Other divisions'} className="grid gap-4 sm:grid-cols-2">
              <DivisionLink division={prev} label={lang === 'ar' ? 'القسم السابق' : 'Previous'} />
              <DivisionLink division={next} label={lang === 'ar' ? 'القسم التالي' : 'Next'} align="end" />
            </nav>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Figure({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const { lang } = useLang()
  const { ref, value: v } = useCountUp(value, 1600)
  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <span ref={ref} className="u-display block text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-green tabular-nums">
        <bdi dir="ltr">
          {v.toLocaleString(lang === 'ar' ? 'ar-IQ' : 'en-US')}
          {suffix ?? ''}
        </bdi>
      </span>
      <p className="mt-2 text-sm text-n-400">{label}</p>
    </div>
  )
}

function DivisionLink({ division, label, align = 'start' }: { division: Division; label: string; align?: 'start' | 'end' }) {
  const { t } = useLang()
  return (
    <Link
      href={`/divisions/${division.slug}`}
      className={`group flex items-center gap-5 border border-white/10 p-5 transition-colors hover:border-green ${align === 'end' ? 'flex-row-reverse text-end' : ''}`}
    >
      <SportIcon name={division.icon} className="h-9 w-9 shrink-0 text-green" />
      <span className="flex flex-col gap-1">
        <span className="u-mono text-[0.58rem] text-n-500">{label}</span>
        <span className="u-display text-xl text-paper transition-colors group-hover:text-green">{t(division.title)}</span>
      </span>
    </Link>
  )
}
