'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * One Lenis instance drives the page; GSAP's ticker drives Lenis; ScrollTrigger
 * reads position from Lenis. Wiring it in that order is what keeps pinned
 * sections, the WebGL camera and the DOM in lockstep — three independent rAF
 * loops would drift apart by a frame and show as tearing between the canvas and
 * the text sitting on top of it.
 */

type ScrollCtx = {
  /** document scroll offset in px, updated every frame */
  progressRef: React.RefObject<number>
  lenis: Lenis | null
  scrollTo: (target: string | number, opts?: { offset?: number }) => void
  ready: boolean
}

const Ctx = createContext<ScrollCtx | null>(null)

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const progressRef = useRef(0)
  const lenisRef = useRef<Lenis | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Native scrolling only. ScrollTrigger still works; nothing is smoothed.
      ScrollTrigger.refresh()
      setReady(true)
      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Touch devices keep their native inertia; overriding it feels broken.
      syncTouch: false,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      progressRef.current = scroll
      ScrollTrigger.update()
    })

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (typeof value === 'number') lenis.scrollTo(value, { immediate: true })
        return lenis.scroll
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    })

    ScrollTrigger.refresh()
    setReady(true)

    // Late-loading media (the hero video, webfonts) changes layout height, so
    // measurements have to be retaken rather than trusted from first paint.
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    const fontsReady = document.fonts?.ready
    fontsReady?.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => {
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(tick)
      ScrollTrigger.getAll().forEach((t) => t.kill())
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Route changes: the provider outlives the page, so it has to reset the
  // position itself (Next's own scroll-to-top is invisible to Lenis) and honour
  // a hash the new page arrived with — the header links home with one.
  const pathname = usePathname()
  useEffect(() => {
    const hash = window.location.hash
    const lenis = lenisRef.current

    if (!hash) {
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
      ScrollTrigger.refresh()
      return
    }

    // The preloader holds scroll for the first few hundred ms of every page,
    // so the jump waits for its release. It then scrolls *immediately* rather
    // than animating: several ScrollTrigger.refresh() calls fire while the new
    // page mounts (pins, fonts, media), and each one restores whatever Lenis
    // believes the position is — which stomps an in-flight tween but leaves an
    // already-settled position alone. A second pass on the next frame corrects
    // for any layout height that a refresh just changed above the target. The
    // hard timeout covers the reduced-motion path where no preloader mounts.
    let done = false
    const settle = () => {
      const el = document.querySelector(hash)
      if (!el) return
      if (lenisRef.current) lenisRef.current.scrollTo(el as HTMLElement, { offset: -8, immediate: true, force: true })
      else el.scrollIntoView()
    }
    const jump = () => {
      if (done) return
      done = true
      window.removeEventListener('iqsg:entered', jump)
      window.clearTimeout(fallback)
      settle()
      ScrollTrigger.refresh()
      requestAnimationFrame(() => {
        settle()
        window.setTimeout(settle, 400)
      })
    }
    const fallback = window.setTimeout(jump, 2500)
    window.addEventListener('iqsg:entered', jump)
    return () => {
      done = true
      window.removeEventListener('iqsg:entered', jump)
      window.clearTimeout(fallback)
    }
  }, [pathname])

  const value = useMemo<ScrollCtx>(
    () => ({
      progressRef,
      lenis: lenisRef.current,
      ready,
      scrollTo: (target, opts) => {
        const offset = opts?.offset ?? 0
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, { offset, duration: 1.4 })
          return
        }
        const el = typeof target === 'string' ? document.querySelector(target) : null
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY + offset
          window.scrollTo({ top, behavior: 'smooth' })
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target + offset, behavior: 'smooth' })
        }
      },
    }),
    [ready],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useScroll() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useScroll must be used inside <ScrollProvider>')
  return ctx
}

/** Locks/unlocks page scroll — used by the preloader and the mobile menu. */
export function useScrollLock(locked: boolean) {
  const { lenis } = useScroll()
  useEffect(() => {
    if (locked) {
      lenis?.stop()
      document.documentElement.classList.add('lenis-stopped')
      document.body.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.classList.remove('lenis-stopped')
      document.body.style.overflow = ''
    }
    return () => {
      document.documentElement.classList.remove('lenis-stopped')
      document.body.style.overflow = ''
    }
  }, [locked, lenis])
}
