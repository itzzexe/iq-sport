'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/lib/lang'
import { ABOUT, PILLARS, SITE } from '@/data/site'
import { Eyebrow, Picture, Reveal, SplitHeading } from './primitives'

export function About() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Slow counter-scroll on the image gives the column depth without a
      // second scroll context to keep in sync.
      gsap.fromTo(
        '[data-about-media]',
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [])

  const headline = lang === 'ar' ? ['الأولى في العراق', 'من نوعها'] : ['The first', 'of its kind']

  return (
    <section ref={root} id="about" className="shell relative py-[clamp(5rem,14vh,10rem)]">
      <div className="grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal className="sticky top-28">
            <Eyebrow label={ABOUT.eyebrow} index="01" />
            <SplitHeading
              lines={headline}
              className="mt-6 text-[clamp(2.25rem,5.5vw,4.5rem)] text-paper"
            />

            <div className="mt-10 flex flex-wrap gap-2">
              {PILLARS.map((pillar, i) => (
                <span
                  key={pillar.key}
                  className="js-fade rounded-full border border-white/15 px-4 py-1.5 text-xs text-n-300"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {t(pillar.label)}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              {ABOUT.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="js-fade max-w-[62ch] text-[clamp(1rem,1.5vw,1.3rem)] leading-[1.75] text-n-300"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {t(paragraph)}
                </p>
              ))}
            </div>

            <div data-about-media className="js-fade relative aspect-[16/10] overflow-hidden">
              <Picture
                name="aerial-complex"
                alt={
                  lang === 'ar'
                    ? 'لقطة جوية لمجمع مجموعة العراق الرياضية'
                    : 'Aerial view of the IQ Sports Group complex'
                }
                className="h-full w-full"
                imgClassName="scale-110"
                sizes="(min-width: 1024px) 58vw, 92vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <span className="u-mono text-[0.6rem] text-paper/80">{t(SITE.name)}</span>
                <span className="u-mono text-[0.6rem] text-green">{t(SITE.city)}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
