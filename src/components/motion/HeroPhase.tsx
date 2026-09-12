'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReady } from '@/lib/scroll'
import { clamp01, phase } from '@/webgl/store'

/**
 * Drop this inside a page's opening section. It publishes that section's
 * scroll progress (`phase.hero`), the whole-document progress (`phase.page`)
 * and a smoothed scroll velocity to the WebGL store, parallaxes the copy
 * block marked `data-hero-copy`, and reveals the split headline once the
 * preloader has handed over. Everything the canvas does through the opening
 * act is driven from here.
 */
export function HeroPhase({ dimCanvas = false }: { dimCanvas?: boolean }) {
  const marker = useRef<HTMLSpanElement>(null)
  const ready = useScrollReady()

  useEffect(() => {
    const section = marker.current?.parentElement
    if (!section || !ready) return
    gsap.registerPlugin(ScrollTrigger)

    // Fresh page: start the scene from zero so it does not inherit the previous
    // route's end state through the shared store.
    phase.hero = 0
    phase.page = 0
    phase.divisions = 0
    phase.divisionIndex = 0
    phase.velocity = 0

    const canvasRoot = () => document.querySelector<HTMLElement>('.webgl-root')

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          phase.hero = clamp01(self.progress)
          // getVelocity() is px/s; 2500 maps a brisk flick to roughly 1.
          phase.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500)
          // Past the hero the scene becomes ambience: alive behind the copy but
          // dropped to a third so paragraphs read over it.
          if (dimCanvas) {
            const root = canvasRoot()
            if (root) root.style.opacity = String(1 - phase.hero * 0.68)
          }
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

      // Copy parallaxes up and dissolves as the hero leaves.
      const copy = section.querySelector('[data-hero-copy]')
      if (copy) {
        gsap.to(copy, {
          yPercent: -24,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
      }
    }, section)

    // Velocity decays on its own so the shaders relax when scrolling stops.
    const decay = () => {
      phase.velocity *= 0.93
    }
    gsap.ticker.add(decay)

    // Entrance: the headline rises once the preloader has cleared.
    const heading = section.querySelector('h1')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveal = () => heading?.classList.add('is-revealed')
    const timer = window.setTimeout(reveal, reduced ? 0 : 1150)
    window.addEventListener('iqsg:entered', reveal)

    ScrollTrigger.refresh()

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('iqsg:entered', reveal)
      gsap.ticker.remove(decay)
      ctx.revert()
      const root = canvasRoot()
      if (root) root.style.opacity = ''
    }
  }, [dimCanvas, ready])

  return <span ref={marker} hidden aria-hidden="true" />
}
