'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/lib/lang'
import { useScroll } from '@/lib/scroll'
import { phase } from '@/webgl/store'
import { SITE, UI } from '@/data/site'
import { LogoMark } from './primitives'

export function Footer() {
  const { t, lang } = useLang()
  const { scrollTo } = useScroll()
  const meter = useRef<HTMLSpanElement>(null)

  // Reads the same store the 3D layer reads, so the meter can never disagree
  // with what the canvas is doing.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = meter.current
      if (el) el.style.transform = `scaleX(${phase.page})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/10 bg-n-950">
      <span
        ref={meter}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-green"
        style={{ transform: 'scaleX(0)' }}
      />

      <div className="shell flex flex-col gap-10 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => scrollTo(0)}
            className="group flex items-center gap-4 text-start"
            aria-label={lang === 'ar' ? 'العودة إلى الأعلى' : 'Back to top'}
          >
            <LogoMark className="w-12 text-green transition-transform duration-500 group-hover:-translate-y-1" />
            <span className="u-mono text-[0.6rem] text-n-500 transition-colors group-hover:text-green">
              {lang === 'ar' ? 'العودة إلى الأعلى' : 'Back to top'}
            </span>
          </button>

          <p className="u-mono max-w-[30ch] text-[0.6rem] leading-relaxed text-n-600">
            {t(SITE.concept)}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="u-mono text-[0.6rem] text-n-600">
            © {year} {t(SITE.name)} — {t(UI.rights)}
          </p>
          <p className="u-mono text-[0.6rem] text-n-600">{t(UI.established)}</p>
        </div>
      </div>
    </footer>
  )
}
