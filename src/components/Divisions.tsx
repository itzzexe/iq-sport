'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/lib/lang'
import { useMedia } from '@/lib/hooks'
import { clamp01, phase } from '@/webgl/store'
import { DIVISIONS } from '@/data/site'
import { BackgroundVideo, Eyebrow, Picture, SportIcon } from './primitives'

/**
 * The pinned act. Scrolling here does not move the page — it rotates the 3D ring
 * behind the copy and swaps the caption in front of it, one division at a time.
 *
 * On narrow screens the ring is replaced by a stacked, scroll-through list: a
 * pinned horizontal scrub on a phone fights the browser's own gestures and
 * leaves people stuck, so it is not worth the trick.
 */
export function Divisions() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const isDesktop = useMedia('(min-width: 1024px)', false)

  useEffect(() => {
    const el = root.current
    if (!el || !isDesktop) {
      phase.divisions = 0
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    const count = DIVISIONS.length

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        // One viewport of scroll per division, plus one to enter and settle.
        end: () => `+=${window.innerHeight * count * 0.9}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = clamp01(self.progress)
          phase.divisions = p
          // Map progress across the panels, holding briefly on each.
          const scaled = p * (count - 1)
          phase.divisionIndex = scaled
          const nearest = Math.round(scaled)
          setIndex((prev) => (prev === nearest ? prev : nearest))
        },
        onLeave: () => {
          phase.divisions = 1
        },
        onLeaveBack: () => {
          phase.divisions = 0
        },
      })

      return () => st.kill()
    }, el)

    return () => {
      ctx.revert()
      phase.divisions = 0
    }
  }, [isDesktop])

  const active = DIVISIONS[index] ?? DIVISIONS[0]

  return (
    <section ref={root} id="divisions" className="relative">
      {isDesktop ? (
        <div className="relative flex h-[100svh] flex-col justify-between overflow-hidden">
          {/* Top rail: section label + progress across the six divisions. */}
          <div className="shell flex items-center justify-between pt-28">
            <Eyebrow
              label={{ ar: 'أقسام المجموعة', en: 'Our divisions' }}
              index="02"
            />
            <div className="flex items-center gap-2">
              {DIVISIONS.map((division, i) => (
                <span
                  key={division.slug}
                  className={[
                    'h-px transition-all duration-500',
                    i === index ? 'w-10 bg-green' : 'w-5 bg-white/25',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>

          {/* Caption sits over the WebGL ring rendered by the global canvas. */}
          <div className="shell grid grid-cols-12 items-end gap-8 pb-[clamp(3rem,8vh,6rem)]">
            <div className="col-span-12 flex items-end justify-between gap-10 xl:col-span-11">
              <div className="max-w-[54ch]">
                <div className="flex items-center gap-4">
                  <SportIcon name={active.icon} className="h-9 w-9 shrink-0 text-green" />
                  <span className="u-mono text-[0.6rem] text-n-500">
                    {String(index + 1).padStart(2, '0')} / {String(DIVISIONS.length).padStart(2, '0')}
                  </span>
                </div>

                {/* keyed so the text re-mounts and re-animates per division */}
                <div key={active.slug} className="mt-5 animate-[fadeUp_700ms_var(--ease-brand)_both]">
                  <h2 className="u-display text-[clamp(2.5rem,6vw,5rem)] text-paper">
                    {t(active.title)}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-n-300 sm:text-base">
                    {t(active.body)}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                    {active.meta.map((m) => (
                      <li key={m.en} className="u-mono text-[0.6rem] text-green">
                        {t(m)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/divisions/${active.slug}`}
                    className="group mt-7 inline-flex items-center gap-3 border-b border-green pb-1 text-sm text-paper transition-colors hover:text-green"
                  >
                    {lang === 'ar' ? 'استكشف القسم' : 'Explore the division'}
                    <span className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                      {lang === 'ar' ? '←' : '→'}
                    </span>
                  </Link>
                </div>
              </div>

              <p className="hidden max-w-[26ch] text-end text-xs leading-relaxed text-n-500 xl:block">
                {t(active.kicker)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------- stacked, touch-first */
        <div className="shell py-[clamp(4rem,10vh,7rem)]">
          <Eyebrow label={{ ar: 'أقسام المجموعة', en: 'Our divisions' }} index="02" />

          <div className="mt-10 flex flex-col gap-16">
            {DIVISIONS.map((division, i) => (
              <article key={division.slug} className="group">
                <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10]">
                  {division.video ? (
                    <BackgroundVideo name={division.video} className="scale-105" />
                  ) : (
                    <Picture
                      name={division.image}
                      alt={t(division.title)}
                      className="h-full w-full"
                      sizes="94vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                  <span className="u-mono absolute top-4 end-4 text-[0.6rem] text-green">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <SportIcon
                    name={division.icon}
                    className="absolute bottom-4 start-4 h-8 w-8 text-green"
                  />
                </div>

                <h2 className="u-display mt-5 text-[clamp(1.9rem,8vw,2.75rem)] text-paper">
                  <Link href={`/divisions/${division.slug}`} className="transition-colors hover:text-green">
                    {t(division.title)}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-n-300">{t(division.body)}</p>
                <Link
                  href={`/divisions/${division.slug}`}
                  className="mt-4 inline-flex items-center gap-2 border-b border-green pb-0.5 text-sm text-paper"
                >
                  {lang === 'ar' ? 'استكشف القسم' : 'Explore'}
                  <span>{lang === 'ar' ? '←' : '→'}</span>
                </Link>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {division.meta.map((m) => (
                    <li key={m.en} className="u-mono text-[0.58rem] text-green">
                      {t(m)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
