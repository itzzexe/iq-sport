import type { CSSProperties } from 'react'
import { MARK, SPORT_GLYPHS, WORDMARK, type Glyph } from './glyphs'

function Els({ glyph, fill }: { glyph: Glyph; fill?: string }) {
  return (
    <>
      {glyph.els.map((el, i) =>
        el.tag === 'circle' ? (
          <circle key={i} cx={el.cx} cy={el.cy} r={el.r} fill={fill} />
        ) : (
          <path
            key={i}
            d={el.d}
            fill={el.fill ?? fill ?? 'currentColor'}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
        ),
      )}
    </>
  )
}

/** Two-stripe mark on its own. Colour follows `currentColor`. */
export function LogoMark({ className, style, title }: { className?: string; style?: CSSProperties; title?: string }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      className={className}
      style={{ aspectRatio: '113.9 / 73.22', ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <Els glyph={MARK} fill="currentColor" />
    </svg>
  )
}

/**
 * Full horizontal lockup. The mark is always brand green; the wordmark follows
 * `currentColor` so it reads on both dark and light grounds.
 */
export function LogoLockup({
  className,
  style,
  title = 'IQ Sports Group',
  markColor = '#00FF00',
}: {
  className?: string
  style?: CSSProperties
  title?: string
  markColor?: string
}) {
  return (
    <svg
      viewBox={WORDMARK.viewBox}
      className={className}
      style={{ aspectRatio: '330.73 / 73.22', ...style }}
      role="img"
      aria-label={title}
      focusable="false"
    >
      <Els glyph={MARK} fill={markColor} />
      <Els glyph={WORDMARK} fill="currentColor" />
    </svg>
  )
}

export const SPORT_ICON_NAMES = Object.keys(SPORT_GLYPHS)

/** One of the six sport icons; falls back to the mark for unknown names. */
export function SportIcon({ name, className, style }: { name?: string | null; className?: string; style?: CSSProperties }) {
  const glyph = (name && SPORT_GLYPHS[name]) || MARK
  return (
    <svg viewBox={glyph.viewBox} className={className} style={style} aria-hidden="true" focusable="false">
      <Els glyph={glyph} fill="currentColor" />
    </svg>
  )
}
