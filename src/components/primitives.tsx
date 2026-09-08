'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/lang'
import { imageMeta, srcSetFor, useMedia, useNearViewport, useReveal } from '@/lib/hooks'
import type { Bi } from '@/data/site'

/* ------------------------------------------------------------------- logo */

/**
 * Two things matter here and both are easy to get wrong.
 *
 * 1. A bare `<use>` gets a viewport at x=0,y=0 sized to 100% of the *outer*
 *    viewBox. The symbol carries the artwork's real origin (255.53, 283.68), so
 *    the outer viewBox has to start at 0,0 or the logo is painted outside its
 *    own window and vanishes while still measuring the right size.
 * 2. `width: auto` on an SVG collapses to zero inside a flex row in several
 *    engines, so the aspect ratio is declared and height drives the width.
 */
export function LogoLockup({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      style={{ aspectRatio: '330.7 / 73.22', width: 'auto' }}
      viewBox="0 0 330.70 73.22"
      role="img"
      aria-label={title ?? 'IQ Sports Group'}
    >
      <use href="#ic-lockup" />
    </svg>
  )
}

export function LogoMark({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={{ aspectRatio: '113.9 / 73.22', ...style }}
      viewBox="0 0 113.90 73.22"
      aria-hidden="true"
      focusable="false"
    >
      <use href="#ic-mark" fill="currentColor" />
    </svg>
  )
}

export function SportIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false" fill="currentColor">
      <use href={`#ic-${name}`} />
    </svg>
  )
}

/* ------------------------------------------------------------------ layout */

/** Section shell: consistent rhythm, an id for the nav, and reveal wiring. */
export function Section({
  id,
  children,
  className = '',
  as: Tag = 'section',
}: {
  id?: string
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div' | 'footer'
}) {
  return (
    <Tag id={id} className={`relative z-10 ${className}`}>
      {children}
    </Tag>
  )
}

/** Wraps children and adds `is-revealed` on entry; children use .js-fade etc. */
export function Reveal({
  children,
  className = '',
  threshold,
}: {
  children: React.ReactNode
  className?: string
  threshold?: number
}) {
  const ref = useReveal<HTMLDivElement>({ threshold })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Heading whose lines rise into place from a clipped mask. */
export function SplitHeading({
  lines,
  className = '',
  as: Tag = 'h2',
}: {
  lines: string[]
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <Tag className={`u-display ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="js-split-line" style={{ '--i': i } as React.CSSProperties}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  )
}

export function Eyebrow({ label, index }: { label: Bi; index?: string }) {
  const { t } = useLang()
  return (
    <div className="flex items-center gap-3">
      {index && (
        <bdi dir="ltr" className="u-mono text-[0.65rem] text-green">
          {index}
        </bdi>
      )}
      <span className="u-eyebrow">{t(label)}</span>
      <span className="u-rule h-px w-12 shrink-0 sm:w-20" />
    </div>
  )
}

/* ------------------------------------------------------------------ media */

/**
 * Image with a real blur-up: the LQIP is a 20px WebP baked into the bundle, so
 * the placeholder paints on first paint with no extra request.
 */
export function Picture({
  name,
  alt,
  className = '',
  imgClassName = '',
  sizes = '100vw',
  priority = false,
}: {
  name: string
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
}) {
  const meta = imageMeta(name)
  const srcSet = srcSetFor(name)

  return (
    <div
      className={`relative overflow-hidden bg-n-900 ${className}`}
      style={
        meta.lqip
          ? {
              backgroundImage: `url("${meta.lqip}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <img
        src={`/img/${name}.jpg`}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={meta.w}
        height={meta.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  )
}

/**
 * Autoplaying, muted, looping background clip.
 *
 * `playsInline` + `muted` is what lets iOS start it without a tap. The poster
 * is painted twice on purpose: once via the attribute, and once as a background
 * image on the wrapper. Autoplay refusal is not hypothetical — iOS Low Power
 * Mode, Data Saver and some enterprise policies all block it, and in several of
 * those cases the element renders transparent rather than falling back to its
 * poster. The wrapper guarantees the frame is always there underneath.
 */
export function BackgroundVideo({
  name,
  className = '',
  poster,
}: {
  name: string
  /** applied to the wrapper, so opacity/scale cover the poster and the clip alike */
  className?: string
  poster?: string
}) {
  const posterJpg = poster ?? `/video/${name}-poster.jpg`
  const posterWebp = poster ? undefined : `/video/${name}-poster.webp`
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  const { ref, near } = useNearViewport<HTMLDivElement>('60% 0px')

  // Once a clip has been mounted it stays mounted; unmounting on scroll-away
  // would make it re-download the next time the section comes back.
  const [everNear, setEverNear] = useState(false)
  useEffect(() => {
    if (near) setEverNear(true)
  }, [near])

  // The poster is a CSS background, and browsers fetch those as soon as the
  // element renders — on-screen or not. Withholding the declaration until the
  // section is close keeps four off-screen stills off the critical path.
  const backgroundImage = everNear ? `url("${posterWebp ?? posterJpg}")` : undefined

  return (
    <div
      ref={ref}
      className={`absolute inset-0 bg-cover bg-center ${className}`}
      style={{ backgroundImage }}
      aria-hidden="true"
    >
      {/* Two gates before a clip is fetched at all:
          - prefers-reduced-motion — a looping background is exactly the kind of
            continuous motion that setting exists to suppress;
          - proximity — mounting all five up front pulled ~7 MB on first load for
            four clips nobody had scrolled to yet.
          The poster underneath carries the frame in both cases. */}
      {!reducedMotion && everNear && (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source src={`/video/${name}.webm`} type="video/webm" />
          <source src={`/video/${name}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
