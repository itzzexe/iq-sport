import Link from 'next/link'
import { href, type Locale } from '@/lib/i18n'
import type { T } from '@/lib/labels'
import type { MediaRef } from '@/lib/media'
import { LogoMark } from '../brand/Logo'
import { HeroPhase } from '../motion/HeroPhase'
import { Media } from './Media'

/** Structured data. `<` is escaped so content can never break out of the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

export function Eyebrow({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  if (!children) return null
  return <p className={`u-eyebrow ${className}`}>{children}</p>
}

/** Direction-aware arrow: points forward in the reading direction. */
export function Arrow({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0 rtl:-scale-x-100`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

/**
 * The "return to the home page" block that closes every inner page — the
 * arrow from the sketch. Lands on the sections grid so the reader is back
 * where they chose this page.
 */
export function BackHome({ locale, t, extra }: { locale: Locale; t: T; extra?: React.ReactNode }) {
  return (
    <section className="shell border-t u-hairline py-[clamp(3rem,8vh,5rem)]" aria-label={t('backHome')}>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href={href(locale, '/#sections')} className="group inline-flex items-center gap-4 text-start">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-green/60 text-green transition-colors duration-300 group-hover:bg-green group-hover:text-ink">
            <BackArrow />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-medium text-paper transition-colors group-hover:text-green sm:text-xl">
              {t('backHome')}
            </span>
            <span className="text-sm text-n-500">{t('backToSections')}</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {extra}
          <LogoMark className="w-10 text-green/70" />
        </div>
      </div>
    </section>
  )
}

/** Arrow pointing "back" (towards the start of the reading direction). */
export function BackArrow({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0 rtl:-scale-x-100`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  )
}

/** Heading band shared by inner pages: eyebrow, title, intro and an optional image. */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow?: string | null
  title: string
  intro?: string | null
  image?: MediaRef
  children?: React.ReactNode
}) {
  return (
    <header className="relative overflow-hidden border-b u-hairline">
      <HeroPhase />
      {image && (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <Media media={image} size="hero" fill sizes="100vw" priority imgClassName="opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/70 to-ink" />
        </div>
      )}
      <div className="shell pb-14 pt-36 sm:pb-20 sm:pt-44">
        <div data-hero-copy className="max-w-4xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.4rem,6vw,5rem)] text-paper">
            <span className="js-split-line">
              <span>{title}</span>
            </span>
          </h1>
          {intro && <p className="mt-6 max-w-[58ch] text-base leading-[1.8] text-n-300 sm:text-lg">{intro}</p>}
          {children}
        </div>
      </div>
    </header>
  )
}

/** Small "index" number used beside list items — always Latin digits, isolated from bidi. */
export function Index({ n }: { n: number }) {
  return (
    <bdi dir="ltr" className="u-mono text-[0.65rem] text-green">
      {String(n).padStart(2, '0')}
    </bdi>
  )
}
