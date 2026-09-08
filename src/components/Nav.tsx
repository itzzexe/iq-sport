'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLang } from '@/lib/lang'
import { useScroll, useScrollLock } from '@/lib/scroll'
import { NAV, SITE, UI } from '@/data/site'
import { LogoLockup } from './primitives'

export function Nav() {
  const { t, lang, toggle } = useLang()
  const { scrollTo } = useScroll()
  const [open, setOpen] = useState(false)
  const [condensed, setCondensed] = useState(false)
  const [active, setActive] = useState<string>('')

  useScrollLock(open)

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > window.innerHeight * 0.55)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlights the section currently occupying the middle of the viewport.
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (sections.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pathname = usePathname()
  const router = useRouter()

  // The nav targets sections of the home page. From anywhere else it has to
  // route home first and let the scroll provider pick up the hash.
  const go = (id: string) => {
    setOpen(false)
    if (pathname !== '/') {
      router.push(`/#${id}`)
      return
    }
    scrollTo(`#${id}`, { offset: -8 })
  }

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          condensed
            ? 'border-b border-white/10 bg-ink/70 py-3 backdrop-blur-xl'
            : 'border-b border-transparent py-5',
        ].join(' ')}
      >
        <div className="shell flex items-center justify-between gap-6">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              scrollTo(0)
            }}
            className="group flex items-center gap-3"
            aria-label={t(SITE.name)}
          >
            <LogoLockup
              className="h-6 w-auto text-paper transition-opacity group-hover:opacity-80 sm:h-7"
              title={t(SITE.name)}
            />
          </a>

          <nav aria-label={t(UI.menu)} className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={active === item.id ? 'true' : undefined}
                className={[
                  'relative rounded-full px-4 py-2 text-sm transition-colors',
                  active === item.id ? 'text-green' : 'text-n-300 hover:text-paper',
                ].join(' ')}
              >
                {t(item.label)}
                <span
                  className={[
                    'absolute inset-x-3 bottom-1 h-px origin-center bg-green transition-transform duration-300',
                    active === item.id ? 'scale-x-100' : 'scale-x-0',
                  ].join(' ')}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="u-mono rounded-full border border-white/15 px-3 py-1.5 text-[0.65rem] text-n-300 transition-colors hover:border-green hover:text-green"
              aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>

            <button
              onClick={() => go('contact')}
              className="u-mono hidden rounded-full bg-green px-5 py-2 text-[0.65rem] text-ink transition-transform hover:scale-[1.04] sm:block"
            >
              {t(UI.book)}
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t(UI.close) : t(UI.menu)}
            >
              <span className="relative block h-4 w-6">
                <span
                  className={[
                    'absolute inset-x-0 h-px bg-paper transition-all duration-300',
                    open ? 'top-1/2 rotate-45' : 'top-0.5',
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute inset-x-0 h-px bg-paper transition-all duration-300',
                    open ? 'top-1/2 -rotate-45' : 'bottom-0.5',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu for narrow viewports. */}
      <div
        id="mobile-nav"
        className={[
          'fixed inset-0 z-40 flex flex-col justify-center bg-ink/95 backdrop-blur-2xl transition-all duration-500 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        style={{ clipPath: open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }}
        aria-hidden={!open}
      >
        <nav className="shell flex flex-col gap-1" aria-label={t(UI.menu)}>
          {NAV.map((item, i) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              tabIndex={open ? 0 : -1}
              className="group flex items-baseline gap-4 border-b border-white/10 py-4 text-start"
              style={{
                transitionDelay: `${i * 45}ms`,
                transform: open ? 'none' : 'translateY(18px)',
                opacity: open ? 1 : 0,
                transition: 'transform 600ms var(--ease-brand), opacity 600ms var(--ease-brand)',
              }}
            >
              <span className="u-mono text-[0.6rem] text-green">0{i + 1}</span>
              <span className="u-display text-3xl text-paper transition-colors group-hover:text-green sm:text-4xl">
                {t(item.label)}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
