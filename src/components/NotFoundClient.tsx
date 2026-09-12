'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { href, isLocale, type Locale } from '@/lib/i18n'
import { LogoMark } from './brand/Logo'
import { BackArrow } from './ui/bits'

export type NotFoundCopy = { title: string; body: string; back: string }

/**
 * The 404 boundary is rendered inside every page, so it must stay static:
 * the locale is read from the browser URL instead of request headers.
 */
export function NotFoundClient({ copy }: { copy: Record<Locale, NotFoundCopy> }) {
  const pathname = usePathname()
  const first = pathname.split('/')[1] ?? ''
  const locale: Locale = isLocale(first) ? first : 'ar'
  const c = copy[locale]

  return (
    <section lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="shell flex min-h-[70svh] flex-col items-start justify-center gap-8 py-32">
      <LogoMark className="w-14 text-green" />
      <div>
        <p className="u-mono text-sm text-n-500">404</p>
        <h1 className="mt-3 text-[clamp(2.2rem,6vw,4.5rem)] text-paper">{c.title}</h1>
        <p className="mt-4 max-w-[50ch] text-lg text-n-300">{c.body}</p>
      </div>
      <Link href={href(locale, '/')} className="u-btn u-btn-primary">
        <BackArrow className="h-5 w-5" />
        {c.back}
      </Link>
    </section>
  )
}
