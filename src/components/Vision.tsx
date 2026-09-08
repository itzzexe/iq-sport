'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/lib/lang'
import { VISION } from '@/data/site'
import { BackgroundVideo, Eyebrow, LogoMark } from './primitives'

/**
 * The vision statement is revealed word by word as it is scrolled through —
 * the copy is short and load-bearing, so making the reader pass over each word
 * is the point rather than an effect.
 */
export function Vision() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.querySelectorAll<HTMLElement>('[data-word]').forEach((w) => {
        w.style.opacity = '1'
      })
      return
    }

    const ctx = gsap.context(() => {
      gsap.to('[data-word]', {
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-vision-copy]',
          start: 'top 78%',
          end: 'bottom 55%',
          scrub: 0.4,
        },
      })

      gsap.fromTo(
        '[data-vision-media]',
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [lang])

  const words = t(VISION.body).split(' ')

  return (
    <section ref={root} id="vision" className="relative overflow-hidden py-[clamp(6rem,16vh,12rem)]">
      <div data-vision-media className="absolute inset-0 -z-10 scale-110">
        <BackgroundVideo name="football" className="opacity-[0.18]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />
      </div>

      <div className="shell relative">
        <div className="flex items-center gap-4">
          <LogoMark className="w-9 shrink-0 text-green" />
          <Eyebrow label={VISION.eyebrow} index="06" />
        </div>

        <p
          data-vision-copy
          className="u-display mt-10 max-w-[22ch] text-[clamp(1.75rem,5vw,4rem)] leading-[1.15] text-paper"
        >
          {words.map((word, i) => (
            <span key={i} data-word className="opacity-15 transition-opacity">
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
