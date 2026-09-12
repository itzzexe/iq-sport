'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReady } from '@/lib/scroll'
import { phase } from '@/webgl/store'

/**
 * Slow counter-scroll on media: the child drifts from `-amount`% to
 * `+amount`% of its height while its container crosses the viewport, giving a
 * column depth without a second scroll context to keep in sync. `scale`
 * instead zooms from `scale` down to 1 (used on the branches map).
 */
export function Parallax({
  children,
  amount = 7,
  scale,
  className = '',
}: {
  children: React.ReactNode
  amount?: number
  scale?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const ready = useScrollReady()

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)

    const trigger = el.parentElement ?? el
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        scale ? { scale } : { yPercent: -amount },
        {
          ...(scale ? { scale: 1 } : { yPercent: amount }),
          ease: 'none',
          scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })
    return () => ctx.revert()
  }, [amount, scale, ready])

  return (
    <div ref={ref} className={`relative h-full w-full will-change-transform ${className}`}>
      {children}
    </div>
  )
}

/** Thin progress line at the top of the footer, driven by the same store the canvas reads. */
export function ScrollMeter() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = ref.current
      if (el) el.style.transform = `scaleX(${phase.page})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-px origin-left bg-green rtl:origin-right"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}
