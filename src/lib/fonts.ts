import localFont from 'next/font/local'

/**
 * Brand type stack (brand guideline, page 07), self-hosted as WOFF2.
 *
 *   Arabic headings  DIN Alternate Bold → falls back to Plex Arabic Medium (see note)
 *   Arabic body      IBM Plex Sans Arabic  Thin 100 / Regular 400 / Medium 500
 *   Latin headings   Varien
 *   Latin body       Acumin Variable Concept (weight axis 100–900)
 *
 * NOTE — the supplied "DIN Alternate Bold.ttf" contains no Arabic letterforms
 * (it is the Latin-only Apple face; the guideline's "DINArabic-Bold" is a
 * different font). It is kept first in the Arabic heading stack so any Latin
 * words and digits inside Arabic headings render in DIN, while the Arabic
 * letters themselves fall through to Plex Arabic Medium. Drop DIN Next Arabic
 * Bold into src/fonts and point `dinArabic` at it to complete the stack.
 */

export const dinArabic = localFont({
  src: '../fonts/DINAlternate-Bold.woff2',
  weight: '700',
  style: 'normal',
  display: 'swap',
  variable: '--font-din',
  preload: true,
  // No auto fallback face: it would catch the Arabic letters DIN lacks instead of
  // letting them fall through to Plex Arabic.
  adjustFontFallback: false,
})

export const plexArabic = localFont({
  src: [
    { path: '../fonts/IBMPlexSansArabic-Thin.woff2', weight: '100', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-Medium.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-plex',
  preload: true,
})

export const varien = localFont({
  src: '../fonts/Varien.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-varien',
  preload: true,
  adjustFontFallback: false,
})

export const acumin = localFont({
  src: '../fonts/AcuminVariableConcept.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-acumin',
  preload: false,
  adjustFontFallback: false,
})

export const fontClassNames = [dinArabic.variable, plexArabic.variable, varien.variable, acumin.variable].join(' ')
