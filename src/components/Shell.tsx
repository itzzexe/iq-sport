'use client'

import dynamic from 'next/dynamic'
import { useLang } from '@/lib/lang'
import { UI } from '@/data/site'
import { Preloader } from './Preloader'
import { Nav } from './Nav'
import { Hero } from './Hero'
import { Marquee } from './Marquee'
import { About } from './About'
import { Divisions } from './Divisions'
import { Branches } from './Branches'
import { Stats } from './Stats'
import { Team } from './Team'
import { Vision } from './Vision'
import { Contact } from './Contact'
import { Footer } from './Footer'

/**
 * Three.js is ~150 kB gzipped and useless until the page has painted, so the
 * whole 3D layer is loaded client-side only and after first render. The site is
 * fully readable and navigable before it arrives — and stays that way if the
 * device has no WebGL at all.
 */
const Scene = dynamic(() => import('@/webgl/Scene'), { ssr: false })

export function Shell() {
  const { t } = useLang()

  return (
    <>
      <a
        href="#about"
        className="u-mono fixed start-4 top-4 z-[200] -translate-y-24 rounded-full bg-green px-5 py-3 text-[0.65rem] text-ink transition-transform focus-visible:translate-y-0"
      >
        {t(UI.skip)}
      </a>

      <Preloader />
      <Scene />
      <Nav />

      <main className="relative">
        <Hero />
        <Marquee />
        <About />
        <Divisions />
        <Branches />
        <Stats />
        <Team />
        <Vision />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
