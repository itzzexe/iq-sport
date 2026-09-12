'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { stripLocale } from '@/lib/i18n'
import type { RingPanel } from '@/webgl/DivisionRing'

/*
 * Three.js is ~150 kB gzipped and useless until the page has painted, so both
 * canvases load client-side only, after first render. The site is fully
 * readable before they arrive — and stays that way on devices without WebGL.
 */
const Scene = dynamic(() => import('@/webgl/Scene'), { ssr: false })
const DivisionCanvas = dynamic(() => import('@/webgl/DivisionCanvas'), { ssr: false })
const JourneyCanvas = dynamic(() => import('@/webgl/Journey'), { ssr: false })

/** Sports that have a bespoke 3D scene (see src/webgl/scenes). */
export const DIVISION_SCENES = ['padel', 'gym', 'swimming', 'tennis', 'football', 'basketball'] as const

export type SceneDivision = { slug: string; icon?: string | null }

/**
 * The one WebGL canvas behind the page, mounted from the layout *before*
 * <main> so page content always paints (and receives clicks) above it.
 *
 *   - /divisions             → the journey: a fly-through of every sport's scene
 *   - division detail pages → that sport's own scene, chosen by the division's icon
 *   - everywhere else       → the brand scene: logo ribbons and particles
 */
export function SiteScene({ panels, divisions }: { panels: RingPanel[]; divisions: SceneDivision[] }) {
  const path = stripLocale(usePathname())
  // The divisions page is one continuous route through every sport's scene.
  if (path === '/divisions') return <JourneyCanvas stations={divisions.map((d) => ({ slug: d.slug, sport: d.icon }))} />
  const match = /^\/divisions\/([^/]+)$/.exec(path)
  if (match) {
    const sport = divisions.find((d) => d.slug === decodeURIComponent(match[1]))?.icon
    if (sport && (DIVISION_SCENES as readonly string[]).includes(sport)) return <DivisionCanvas slug={sport} />
    return <Scene />
  }
  return <Scene panels={panels} />
}
