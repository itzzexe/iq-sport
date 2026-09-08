'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/lib/lang'
import { BRANCHES } from '@/data/site'
import { Eyebrow, Picture, Reveal } from './primitives'

/**
 * The four PADEL IQ branches, plotted on the neon Baghdad artwork from the
 * company profile. Hovering or focusing a row lights the matching pin, and the
 * pins are real buttons so the map is operable from the keyboard.
 */
export function Branches() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-map]',
        { scale: 1.12 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="branches" className="shell relative py-[clamp(5rem,14vh,10rem)]">
      <Reveal>
        <Eyebrow label={{ ar: 'فروعنا', en: 'Our branches' }} index="03" />
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="u-display max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.5rem)] text-paper">
            {lang === 'ar' ? 'أربعة فروع في بغداد' : 'Four branches in Baghdad'}
          </h2>
          <p className="max-w-[42ch] text-sm leading-relaxed text-n-400">
            {lang === 'ar'
              ? 'تدير مجموعة العراق الرياضية حالياً أربعة فروع من PADEL IQ في العراق.'
              : 'IQ Sports Group currently operates four PADEL IQ branches across Iraq.'}
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ------------------------------------------------------------ map */}
        <div className="order-2 lg:order-1 lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-ink sm:aspect-[16/11]">
            <div data-map className="absolute inset-0">
              <Picture
                name="baghdad-map"
                alt={lang === 'ar' ? 'خريطة بغداد' : 'Map of Baghdad'}
                className="h-full w-full"
                sizes="(min-width: 1024px) 58vw, 92vw"
              />
            </div>
            <div className="absolute inset-0 bg-ink/25" />

            {BRANCHES.map((branch) => {
              const on = active === branch.slug
              return (
                <button
                  key={branch.slug}
                  type="button"
                  onMouseEnter={() => setActive(branch.slug)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(branch.slug)}
                  onBlur={() => setActive(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${branch.map.x * 100}%`, top: `${branch.map.y * 100}%` }}
                  aria-label={t(branch.name)}
                  aria-pressed={on}
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <span
                      className={[
                        'absolute inline-flex h-full w-full rounded-full bg-green transition-opacity',
                        on ? 'animate-ping opacity-60' : 'opacity-0',
                      ].join(' ')}
                    />
                    <span
                      className={[
                        'relative inline-flex rounded-full bg-green transition-all duration-300',
                        on ? 'h-3.5 w-3.5' : 'h-2 w-2',
                      ].join(' ')}
                    />
                  </span>

                  <span
                    className={[
                      'pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-green px-2 py-1 text-[0.65rem] font-bold text-ink transition-all duration-300',
                      on ? 'opacity-100' : 'translate-x-1 opacity-0',
                    ].join(' ')}
                  >
                    {t(branch.name)}
                  </span>
                </button>
              )
            })}

            <span className="u-mono absolute bottom-3 start-4 text-[0.6rem] text-green/70">
              BAGHDAD
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------- list */}
        <Reveal className="order-1 flex flex-col lg:order-2 lg:col-span-5">
          {BRANCHES.map((branch, i) => {
            const on = active === branch.slug
            return (
              <div
                key={branch.slug}
                onMouseEnter={() => setActive(branch.slug)}
                onMouseLeave={() => setActive(null)}
                className={[
                  'js-fade border-t border-white/10 py-6 transition-colors duration-300',
                  i === BRANCHES.length - 1 ? 'border-b' : '',
                  on ? 'bg-white/[0.04]' : '',
                ].join(' ')}
                style={{ '--i': i } as React.CSSProperties}
              >
                <div className="flex items-baseline gap-4">
                  <span className="u-mono text-[0.6rem] text-green">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={[
                      'u-display text-2xl transition-colors duration-300 sm:text-3xl',
                      on ? 'text-green' : 'text-paper',
                    ].join(' ')}
                  >
                    {t(branch.name)}
                  </h3>
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 ps-9">
                  {branch.facilities.map((f) => (
                    <li key={f.en} className="text-xs text-n-400">
                      {t(f)}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
