'use client'

import { useEffect, useRef, useState } from 'react'
import { useScrollLock } from '@/lib/scroll'
import type { Locale } from '@/lib/i18n'
import { phase } from '@/webgl/store'
import { LogoMark } from './brand/Logo'

/**
 * Holds the page still until the first paint is genuinely ready, then hands
 * over to the scene. The counter is tied to real document readiness rather
 * than a fixed timer, but it is also capped — a slow connection should not
 * leave someone staring at a number that never moves.
 */
export function Preloader({ locale, siteName, loadingLabel }: { locale: Locale; siteName: string; loadingLabel: string }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  const startedAt = useRef(Date.now())

  useScrollLock(!done)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(100)
      setDone(true)
      setGone(true)
      phase.entered = true
      return
    }

    // Every page starts its scene from black; the store is shared across
    // routes so it has to be told this is a fresh entrance.
    phase.entered = false

    // First visit gets the full count-in; later route changes get a quick
    // brand wipe, because a second on every internal link is a tax.
    let seen = false
    try {
      seen = window.sessionStorage.getItem('iqsg:seen') === '1'
      window.sessionStorage.setItem('iqsg:seen', '1')
    } catch {
      /* storage blocked — treat as first visit */
    }

    let raf = 0
    const MIN_MS = seen ? 320 : 900
    const MAX_MS = seen ? 1400 : 4200

    const tick = () => {
      const elapsed = Date.now() - startedAt.current
      const ready = document.readyState === 'complete'
      // Time floor keeps the reveal from flashing; the ceiling keeps a stalled
      // asset from holding the whole page hostage.
      const timeShare = Math.min(1, elapsed / MIN_MS)
      const readyShare = ready ? 1 : Math.min(0.92, elapsed / MAX_MS)
      const next = Math.round(Math.min(timeShare, readyShare) * 100)

      setProgress((prev) => (next > prev ? next : prev))

      if (next >= 100 || elapsed > MAX_MS) {
        setProgress(100)
        setDone(true)
        phase.entered = true
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!done) return
    // Scroll is unlocked by now (the lock effect runs first), so anything that
    // was waiting to move the page — a hash the route arrived with — can go.
    window.dispatchEvent(new CustomEvent('iqsg:entered'))
    const timer = window.setTimeout(() => setGone(true), 1100)
    return () => window.clearTimeout(timer)
  }, [done])

  if (gone) return null

  const rtl = locale === 'ar'

  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink',
        'transition-[clip-path,opacity] duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)]',
        done ? 'pointer-events-none opacity-0' : 'opacity-100',
      ].join(' ')}
      style={{ clipPath: done ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)' }}
      role="status"
      aria-live="polite"
      aria-label={`${loadingLabel} ${progress}%`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* The mark is drawn twice and the top copy is wiped in from the reading
            edge. Clipping a single copy leaves disconnected green fragments
            that read as a broken render rather than as progress. */}
        <div className="relative w-24 sm:w-32">
          <LogoMark className="w-full text-green/15" />
          <LogoMark
            className="absolute inset-0 w-full text-green"
            style={{
              clipPath: `inset(0 ${rtl ? 0 : 100 - progress}% 0 ${rtl ? 100 - progress : 0}%)`,
              transition: 'clip-path 240ms linear',
            }}
          />
        </div>

        <div className="flex items-baseline gap-4">
          <span className="text-sm text-n-500">{siteName}</span>
          <span className="u-mono text-2xl tabular-nums text-paper">{String(progress).padStart(3, '0')}</span>
        </div>

        <div className="h-px w-40 overflow-hidden bg-n-800 sm:w-56">
          <div className="h-full bg-green transition-[width] duration-200 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
