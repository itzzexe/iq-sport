'use client'

import { useLang } from '@/lib/lang'
import { TEAM, TEAM_SUMMARY } from '@/data/site'
import { Eyebrow, Picture, Reveal } from './primitives'

export function Team() {
  const { t, lang } = useLang()

  return (
    <section id="team" className="shell relative py-[clamp(5rem,14vh,10rem)]">
      <Reveal>
        <Eyebrow label={{ ar: 'فريق العمل', en: 'The team' }} index="05" />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="u-display max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.5rem)] text-paper">
            {lang === 'ar' ? 'كوادر متخصصة' : 'Specialist staff'}
          </h2>

          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="u-mono text-[0.6rem] text-n-500">
                {lang === 'ar' ? 'الفرع' : 'Branch'}
              </dt>
              <dd className="mt-1 text-sm text-paper">{t(TEAM_SUMMARY.branch)}</dd>
            </div>
            {TEAM_SUMMARY.rows.map((row) => (
              <div key={row.label.en}>
                <dt className="u-mono text-[0.6rem] text-n-500">{t(row.label)}</dt>
                <dd className="mt-1 text-sm text-green">{t(row.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <Reveal className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((person, i) => (
          <article
            key={person.slug}
            className="js-fade group relative overflow-hidden border border-white/10"
            style={{ '--i': i } as React.CSSProperties}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-n-900">
              <Picture
                name={person.photo}
                alt={t(person.name)}
                className="h-full w-full"
                imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
              />
              {/* Brand duotone that lifts on hover, so the portraits sit inside
                  the identity but still read as real people. */}
              <div className="absolute inset-0 bg-green/20 mix-blend-color transition-opacity duration-700 group-hover:opacity-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="u-display text-lg text-paper sm:text-xl">{t(person.name)}</h3>
              <p className="u-mono mt-1.5 text-[0.6rem] text-green">{t(person.role)}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </section>
  )
}
