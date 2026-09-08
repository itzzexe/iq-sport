'use client'

import { useEffect, useRef, useState } from 'react'
import lqip from '@/data/lqip.json'

type LqipEntry = { w: number; h: number; lqip: string }
const LQIP = lqip as Record<string, LqipEntry>

/** Blur placeholder + intrinsic size for an image in /public/img. */
export function imageMeta(name: string) {
  return LQIP[name] ?? { w: 1600, h: 900, lqip: '' }
}

/** Which widths were actually generated for a given image (never upscaled). */
const WIDTHS = [640, 1280, 1920]
export function srcSetFor(name: string) {
  const { w } = imageMeta(name)
  const sizes = WIDTHS.filter((width) => width <= w)
  if (sizes.length === 0) return undefined
  return sizes.map((width) => `/img/${name}-${width}.webp ${width}w`).join(', ')
}

/**
 * Adds `is-revealed` once an element scrolls into view, then stops observing.
 * The CSS in globals.css owns the actual animation, so reduced-motion users get
 * the end state immediately without any JS branching here.
 */
export function useReveal<T extends HTMLElement>(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [options?.threshold, options?.rootMargin])
  return ref
}

/** Counts 0 → `to` once visible. Respects reduced motion by snapping. */
export function useCountUp(to: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setValue(to)
      return
    }

    let raf = 0
    let start = 0
    const run = (now: number) => {
      if (!start) start = now
      const p = Math.min(1, (now - start) / duration)
      // easeOutExpo — fast arrival, long settle, reads as "counting up and landing"
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setValue(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(run)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          raf = requestAnimationFrame(run)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, duration])

  return { ref, value }
}

/** Tracks pointer position in normalised −1…1 space, throttled to rAF. */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
        pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
        raf = 0
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])
  return pointer
}

/**
 * True while the element is within `rootMargin` of the viewport. Used to defer
 * expensive media until it is nearly on screen — the margin is generous so the
 * clip has time to buffer before anyone can see it.
 */
export function useNearViewport<T extends HTMLElement>(rootMargin = '50% 0px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver((entries) => setNear(entries.some((e) => e.isIntersecting)), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, near }
}

/** Media query as reactive state. */
export function useMedia(query: string, initial = false) {
  const [matches, setMatches] = useState(initial)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}
