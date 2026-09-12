'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReady } from '@/lib/scroll'
import { SportIcon } from '../brand/Logo'

export type MarqueeItem = { key: string; title: string; icon?: string | null }

/**
 * Scroll-reactive ticker of the divisions. It runs at a constant base speed and
 * is *pushed* by scroll velocity, so moving down the page accelerates it and
 * moving up drags it backwards — the band reads as physically coupled to the
 * scroll rather than as a looping GIF sitting on top of it.
 */
export function Marquee({ items }: { items: MarqueeItem[] }) {
  const track = useRef<HTMLDivElement>(null)
  const ready = useScrollReady()

  useEffect(() => {
    const el = track.current
    if (!el || !ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)

    // The track holds the content twice; wrapping at -50% makes the seam
    // invisible regardless of how wide the content ends up being.
    const wrap = gsap.utils.wrap(-50, 0)
    let offset = 0
    let boost = 0
    const setX = gsap.quickSetter(el, 'xPercent')

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        boost += self.getVelocity() / 22000
      },
    })

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000
      offset -= dt * 3.1 + boost
      boost *= 0.9
      setX(wrap(offset))
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      trigger.kill()
    }
  }, [ready])

  if (items.length === 0) return null
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-n-950 py-6" aria-hidden="true">
      <div ref={track} className="flex w-max items-center gap-10 will-change-transform sm:gap-16">
        {doubled.map((item, i) => (
          <div key={`${item.key}-${i}`} className="flex shrink-0 items-center gap-10 sm:gap-16">
            <span className="u-display whitespace-nowrap text-[clamp(1.5rem,4vw,3rem)] text-n-700">{item.title}</span>
            <SportIcon name={item.icon} className="h-6 w-6 shrink-0 text-green sm:h-8 sm:w-8" />
          </div>
        ))}
      </div>
      {/* Edge fades keep the loop from visibly starting and stopping. Physical
          left/right on purpose: the band is decorative and never mirrors. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-n-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-n-950 to-transparent" />
    </div>
  )
}
