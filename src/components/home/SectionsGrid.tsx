import Link from 'next/link'
import type { Home } from '@/payload-types'
import { pageHref, type Locale } from '@/lib/i18n'
import { Media } from '../ui/Media'
import { Reveal } from '../ui/Reveal'
import { Arrow, Eyebrow, Index } from '../ui/bits'

/**
 * The six tiles from the sketch — two columns, each tile opens its own page.
 * Order, labels, blurbs and images are all controlled from the CMS.
 */
export function SectionsGrid({ sections, locale }: { sections: Home['sections']; locale: Locale }) {
  const tiles = (sections?.tiles ?? []).filter((t) => t.enabled !== false && t.page && t.title)
  if (tiles.length === 0) return null

  return (
    <section id="sections" className="shell relative scroll-mt-24 py-[clamp(4rem,12vh,8rem)]">
      <Reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>{sections?.eyebrow}</Eyebrow>
            {sections?.title && (
              <h2 className="js-reveal mt-5 max-w-[20ch] text-[clamp(2rem,4.5vw,3.75rem)] text-paper">{sections.title}</h2>
            )}
          </div>
          {sections?.intro && <p className="js-reveal max-w-[40ch] text-base text-n-400">{sections.intro}</p>}
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2" role="list">
          {tiles.map((tile, i) => (
            <li key={tile.id ?? i} className="js-reveal" style={{ '--i': i } as React.CSSProperties}>
              <Link
                href={pageHref(locale, tile.page)}
                className="group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-n-900 p-6 transition-colors duration-500 hover:border-green/60 sm:min-h-[18rem] sm:p-8"
              >
                {tile.image && (
                  <div className="absolute inset-0" aria-hidden="true">
                    <Media
                      media={tile.image}
                      size="card"
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      imgClassName="opacity-55 transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
                  </div>
                )}

                <div className="relative flex items-end justify-between gap-6">
                  <div>
                    <Index n={i + 1} />
                    <h3 className="mt-2 text-[clamp(1.6rem,3vw,2.4rem)] text-paper transition-colors group-hover:text-green">
                      {tile.title}
                    </h3>
                    {tile.blurb && <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-n-300">{tile.blurb}</p>}
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-paper transition-all duration-300 group-hover:border-green group-hover:bg-green group-hover:text-ink">
                    <Arrow />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
