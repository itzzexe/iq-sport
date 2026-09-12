'use client'

import { useEffect } from 'react'
import { ScrollProvider } from '@/lib/scroll'
import type { Locale } from '@/lib/i18n'
import { phase } from '@/webgl/store'

/**
 * Client-side plumbing shared by every page: the Lenis smooth-scroll +
 * ScrollTrigger provider, and the reading direction pushed into the WebGL
 * store (the 3D mark stages itself opposite the copy, so it must know which
 * side the copy is on).
 */
export function MotionProviders({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useEffect(() => {
    phase.rtl = locale === 'ar'
  }, [locale])

  return <ScrollProvider>{children}</ScrollProvider>
}
