import type { Home } from '@/payload-types'
import { Parallax } from '../motion/Parallax'
import { Media } from '../ui/Media'
import { Reveal } from '../ui/Reveal'
import { Eyebrow } from '../ui/bits'

export function About({ about, siteName }: { about: Home['about']; siteName: string }) {
  const paragraphs = about.paragraphs ?? []
  const pillars = about.pillars ?? []

  return (
    <section id="about" className="shell relative scroll-mt-24 py-[clamp(5rem,14vh,10rem)]">
      <Reveal className="grid gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Eyebrow>{about.eyebrow}</Eyebrow>
            <h2 className="js-reveal mt-6 text-[clamp(2.2rem,5vw,4.25rem)] text-paper">{about.title}</h2>

            {pillars.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label={about.eyebrow ?? undefined}>
                {pillars.map((p, i) => (
                  <li
                    key={p.id ?? i}
                    className="js-reveal rounded-full border border-white/15 px-4 py-1.5 text-sm text-n-300"
                    style={{ '--i': i + 1 } as React.CSSProperties}
                  >
                    {p.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-7">
          <div className="flex flex-col gap-6">
            {paragraphs.map((p, i) => (
              <p
                key={p.id ?? i}
                className="js-reveal max-w-[64ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.85] text-n-300"
                style={{ '--i': i } as React.CSSProperties}
              >
                {p.text}
              </p>
            ))}
          </div>

          {about.image && (
            <figure className="js-reveal relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)]" style={{ '--i': 3 } as React.CSSProperties}>
              <Parallax amount={6}>
                <Media media={about.image} size="wide" fill sizes="(min-width: 1024px) 58vw, 92vw" imgClassName="scale-110" />
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-sm text-paper/80">
                <span>{siteName}</span>
              </figcaption>
            </figure>
          )}
        </div>
      </Reveal>
    </section>
  )
}
