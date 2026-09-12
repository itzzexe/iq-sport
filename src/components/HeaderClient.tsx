'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { href, otherLocale, stripLocale, type Locale } from '@/lib/i18n'
import { useScroll, useScrollLock } from '@/lib/scroll'
import { LogoLockup } from './brand/Logo'

export type NavItem = { href: string; label: string; page: string }

type Labels = { book: string; menu: string; close: string; switchLanguage: string; skip: string }

export function HeaderClient({
  locale,
  items,
  siteName,
  labels,
  bookHref,
}: {
  locale: Locale
  items: NavItem[]
  siteName: string
  labels: Labels
  bookHref: string
}) {
  const pathname = usePathname()
  const { scrollTo } = useScroll()
  const [open, setOpen] = useState(false)
  const [condensed, setCondensed] = useState(false)

  const current = stripLocale(pathname)
  const switchHref = href(otherLocale(locale), current)

  // Lenis owns the scroll, so the drawer locks it through the provider.
  useScrollLock(open)

  // Same-page anchors (e.g. "/#contact" while on the home page) glide with
  // Lenis instead of jumping; cross-page hashes are handled by the provider.
  const onNav = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    setOpen(false)
    const [path, hash] = target.split('#')
    if (!hash) return
    if (stripLocale(path || '/') !== current) return
    e.preventDefault()
    scrollTo(`#${hash}`, { offset: -8 })
    window.history.replaceState(null, '', `#${hash}`)
  }

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the drawer on navigation and on Escape; lock scroll while open.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (item: NavItem) => {
    const path = stripLocale(item.href.split('#')[0] || '/')
    if (path === '/') return false
    return current === path || current.startsWith(`${path}/`)
  }

  return (
    <>
      <a
        href="#main"
        className="fixed start-4 top-4 z-[200] -translate-y-24 rounded-full bg-green px-5 py-3 text-sm font-medium text-ink transition-transform focus-visible:translate-y-0"
      >
        {labels.skip}
      </a>

      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          condensed || open ? 'border-b u-hairline bg-ink/80 py-3 backdrop-blur-xl' : 'border-b border-transparent py-5',
        ].join(' ')}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Link href={href(locale, '/')} className="group flex items-center" aria-label={siteName}>
            <LogoLockup className="h-6 w-auto text-paper transition-opacity group-hover:opacity-80 sm:h-7" title={siteName} />
          </Link>

          <nav aria-label={labels.menu} className="hidden items-center gap-1 lg:flex">
            {items.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.page}
                  href={item.href}
                  onClick={(e) => onNav(e, item.href)}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'relative rounded-full px-4 py-2 text-[0.95rem] transition-colors',
                    active ? 'text-green' : 'text-n-300 hover:text-paper',
                  ].join(' ')}
                >
                  {item.label}
                  <span
                    className={[
                      'absolute inset-x-4 bottom-1 h-px bg-green transition-transform duration-300',
                      active ? 'scale-x-100' : 'scale-x-0',
                    ].join(' ')}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={switchHref}
              hrefLang={otherLocale(locale)}
              lang={otherLocale(locale)}
              className="u-mono rounded-full border border-white/15 px-3 py-1.5 text-[0.7rem] text-n-300 transition-colors hover:border-green hover:text-green"
              aria-label={labels.switchLanguage}
            >
              {labels.switchLanguage}
            </Link>

            <Link href={bookHref} onClick={(e) => onNav(e, bookHref)} className="u-btn u-btn-primary hidden min-h-0 px-5 py-2 text-sm sm:inline-flex">
              {labels.book}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? labels.close : labels.menu}
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
          'fixed inset-0 z-40 flex flex-col justify-center bg-ink/95 backdrop-blur-2xl transition-opacity duration-400 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden={!open}
      >
        <nav className="shell flex flex-col gap-1" aria-label={labels.menu}>
          {items.map((item, i) => (
            <Link
              key={item.page}
              href={item.href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => onNav(e, item.href)}
              className="group flex items-baseline gap-4 border-b border-white/10 py-4 text-start"
              style={{
                transitionDelay: `${i * 40}ms`,
                transform: open ? 'none' : 'translateY(14px)',
                opacity: open ? 1 : 0,
                transition: 'transform 500ms var(--ease-brand), opacity 500ms var(--ease-brand)',
              }}
            >
              <bdi dir="ltr" className="u-mono text-[0.65rem] text-green">
                {String(i + 1).padStart(2, '0')}
              </bdi>
              <span className="u-display text-3xl text-paper transition-colors group-hover:text-green">{item.label}</span>
            </Link>
          ))}
          <Link
            href={bookHref}
            tabIndex={open ? 0 : -1}
            onClick={(e) => onNav(e, bookHref)}
            className="u-btn u-btn-primary mt-8 self-start"
          >
            {labels.book}
          </Link>
        </nav>
      </div>
    </>
  )
}
