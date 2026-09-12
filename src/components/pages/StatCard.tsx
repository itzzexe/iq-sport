'use client'

import { useEffect, useRef, useState } from 'react'
import { formatNumber, type Locale } from '@/lib/i18n'
import { Index } from '../ui/bits'

/** Counts up from 0 once visible; snaps to the final value under reduced motion. */
function useCountUp(to: number, duration: number) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      setValue(to)
      return
    }
    let raf = 0
    let start = 0
    const run = (now: number) => {
      if (!start) start = now
      const p = Math.min(1, (now - start) / duration)
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

export function StatCard({ value, suffix, label, index, locale }: { value: number; suffix?: string | null; label: string; index: number; locale: Locale }) {
  const { ref, value: shown } = useCountUp(value, 1400 + index * 120)
  return (
    <div className="js-reveal group relative flex flex-col justify-between gap-6 border-t border-white/10 py-8" style={{ '--i': index } as React.CSSProperties}>
      <Index n={index + 1} />
      <div>
        {/* Isolated LTR so the suffix stays on the correct side in Arabic ("٧٬٠٠٠+", not "+٧٬٠٠٠"). */}
        <span ref={ref} className="block text-[clamp(2.75rem,7vw,5.5rem)] leading-none text-green tabular-nums">
          <bdi dir="ltr">
            {formatNumber(locale, shown)}
            {suffix ?? ''}
          </bdi>
        </span>
        <p className="mt-3 max-w-[26ch] text-base leading-relaxed text-n-300">{label}</p>
      </div>
      <span className="h-px w-full origin-left scale-x-0 bg-green transition-transform duration-700 group-hover:scale-x-100 rtl:origin-right" />
    </div>
  )
}
