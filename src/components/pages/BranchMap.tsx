'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Branch } from '@/payload-types'
import { href, type Locale } from '@/lib/i18n'
import type { MediaRef } from '@/lib/media'
import { Parallax } from '../motion/Parallax'
import { Media } from '../ui/Media'
import { Index } from '../ui/bits'

type Labels = { facilities: string; bookHere: string; viewOnMap: string; call: string; whatsapp: string; hours: string }

/**
 * Branches plotted on the Baghdad artwork. Hovering or focusing a row lights
 * the matching pin; pins are real buttons so the map works from the keyboard.
 * Pin positions come from each branch's "mapPosition" in the CMS.
 */
export function BranchMap({
  branches,
  mapImage,
  caption,
  locale,
  labels,
}: {
  branches: Branch[]
  mapImage: MediaRef
  caption?: string | null
  locale: Locale
  labels: Labels
}) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-ink sm:aspect-[16/11]">
          {mapImage && (
            <Parallax scale={1.12} className="absolute inset-0">
              <Media media={mapImage} size="wide" fill sizes="(min-width: 1024px) 58vw, 92vw" imgClassName="opacity-90" fallbackSrc="/img/baghdad-map.jpg" />
            </Parallax>
          )}
          <div className="absolute inset-0 bg-ink/20" />

          {branches.map((branch) => {
            const on = active === branch.id
            const x = branch.mapPosition?.x ?? 50
            const y = branch.mapPosition?.y ?? 50
            return (
              <button
                key={branch.id}
                type="button"
                onMouseEnter={() => setActive(branch.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(branch.id)}
                onBlur={() => setActive(null)}
                onClick={() => document.getElementById(`branch-${branch.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={branch.title}
                aria-pressed={on}
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-green ${on ? 'animate-ping opacity-60' : 'opacity-0'}`} />
                  <span className={`relative inline-flex rounded-full bg-green shadow-[0_0_0_3px_rgba(0,0,0,0.6)] transition-all duration-300 ${on ? 'h-4 w-4' : 'h-2.5 w-2.5'}`} />
                </span>
                <span
                  className={`pointer-events-none absolute start-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-green px-2 py-1 text-xs font-medium text-ink transition-all duration-300 ${on ? 'opacity-100' : 'opacity-0'}`}
                >
                  {branch.title}
                </span>
              </button>
            )
          })}

          {caption && <span className="u-mono absolute bottom-3 start-4 text-[0.65rem] text-green/80">{caption}</span>}
        </div>
      </div>

      <ol className="flex flex-col lg:col-span-5" role="list">
        {branches.map((branch, i) => {
          const on = active === branch.id
          const facilities = branch.facilities ?? []
          return (
            <li
              key={branch.id}
              id={`branch-${branch.id}`}
              onMouseEnter={() => setActive(branch.id)}
              onMouseLeave={() => setActive(null)}
              className={`js-reveal border-t border-white/10 py-6 transition-colors duration-300 ${i === branches.length - 1 ? 'border-b' : ''} ${on ? 'bg-white/[0.04]' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className="flex items-baseline gap-4">
                <Index n={i + 1} />
                <h2 className={`text-2xl transition-colors duration-300 sm:text-3xl ${on ? 'text-green' : 'text-paper'}`}>{branch.title}</h2>
              </div>
              {branch.address && <p className="mt-2 ps-9 text-sm text-n-400">{branch.address}</p>}
              {facilities.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 ps-9" aria-label={labels.facilities}>
                  {facilities.map((f) => (
                    <li key={f.id ?? f.label} className="text-sm text-n-300">
                      {f.label}
                    </li>
                  ))}
                </ul>
              )}
              {branch.hours && (
                <p className="mt-2 ps-9 text-xs text-n-500">
                  {labels.hours}: {branch.hours}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 ps-9 text-sm">
                <Link href={`${href(locale, '/')}?branch=${branch.slug}#contact`} className="text-green underline-offset-4 hover:underline">
                  {labels.bookHere}
                </Link>
                {branch.phone && (
                  <a href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`} className="text-n-300 hover:text-paper">
                    {labels.call}
                  </a>
                )}
                {branch.whatsapp && (
                  <a href={`https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-n-300 hover:text-paper">
                    {labels.whatsapp}
                  </a>
                )}
                {branch.mapsUrl && (
                  <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-n-300 hover:text-paper">
                    {labels.viewOnMap}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
