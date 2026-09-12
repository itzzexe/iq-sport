import Link from 'next/link'
import type { Branch, Coach, Division, Tournament } from '@/payload-types'
import { formatDateRange, href, type Locale } from '@/lib/i18n'
import type { T } from '@/lib/labels'
import { SportIcon } from '../brand/Logo'
import { Media } from '../ui/Media'
import { Arrow, Index } from '../ui/bits'

/* ---------------------------------------------------------- divisions */

export function DivisionCard({ division, locale, index, t }: { division: Division; locale: Locale; index: number; t: T }) {
  const highlights = (division.highlights ?? []).slice(0, 3)
  return (
    <article className="js-reveal group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-n-900 transition-colors duration-500 hover:border-green/60" style={{ '--i': index % 3 } as React.CSSProperties}>
      <Link href={href(locale, `/divisions/${division.slug}`)} className="relative aspect-[16/10] overflow-hidden" aria-label={division.title}>
        <Media
          media={division.image}
          size="card"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-n-900 via-transparent to-transparent" />
        <span className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-green backdrop-blur">
          <SportIcon name={division.icon} className="h-6 w-6" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <Index n={index + 1} />
          {division.kicker && <span className="text-xs text-n-500">{division.kicker}</span>}
        </div>
        <h2 className="text-[clamp(1.4rem,2.2vw,1.9rem)] text-paper">
          <Link href={href(locale, `/divisions/${division.slug}`)} className="transition-colors group-hover:text-green">
            {division.title}
          </Link>
        </h2>
        <p className="text-sm leading-[1.75] text-n-300">{division.summary}</p>
        {highlights.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {highlights.map((h) => (
              <li key={h.id ?? h.label} className="rounded-full border border-white/10 px-3 py-1 text-xs text-n-400">
                {h.label}
              </li>
            ))}
          </ul>
        )}
        <Link href={href(locale, `/divisions/${division.slug}`)} className="mt-auto inline-flex items-center gap-2 pt-2 text-sm text-green">
          {t('details')}
          <Arrow className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------ coaches */

export function CoachCard({ coach, index, t, locale }: { coach: Coach; index: number; t: T; locale: Locale }) {
  const division = coach.division && typeof coach.division === 'object' ? coach.division : null
  return (
    <article className="js-reveal group relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-n-900" style={{ '--i': index % 3 } as React.CSSProperties}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <Media
          media={coach.photo}
          size="card"
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
          imgClassName="transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-green/20 mix-blend-color transition-opacity duration-700 group-hover:opacity-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h2 className="text-xl text-paper sm:text-2xl">{coach.name}</h2>
        <p className="mt-1 text-sm text-green">{coach.role}</p>
        {division && (
          <Link href={href(locale, `/divisions/${division.slug}`)} className="mt-2 inline-block text-xs text-n-400 underline decoration-white/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-green">
            {t('division')}: {division.title}
          </Link>
        )}
        {coach.bio && <p className="mt-3 text-sm leading-relaxed text-n-300">{coach.bio}</p>}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------- events */

export type EventLabels = { course: string; tournament: string; upcoming: string; past: string; location: string; details: string }

export function EventCard({ event, locale, labels, index }: { event: Tournament; locale: Locale; labels: EventLabels; index: number }) {
  const branch = event.branch && typeof event.branch === 'object' ? (event.branch as Branch) : null
  const place = event.location || branch?.title
  const isUpcoming = new Date(event.endDate || event.startDate) >= new Date()
  return (
    <article className="js-reveal group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-n-900 transition-colors hover:border-green/60" style={{ '--i': index % 3 } as React.CSSProperties}>
      <Link href={href(locale, `/tournaments/${event.slug}`)} className="relative aspect-[16/10] overflow-hidden" aria-label={event.title}>
        <Media media={event.cover} size="card" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-n-900 via-transparent to-transparent" />
        <div className="absolute start-4 top-4 flex gap-2">
          <span className="rounded-full bg-ink/70 px-3 py-1 text-xs text-paper backdrop-blur">{event.kind === 'course' ? labels.course : labels.tournament}</span>
          <span className={`rounded-full px-3 py-1 text-xs backdrop-blur ${isUpcoming ? 'bg-green text-ink' : 'bg-ink/70 text-n-300'}`}>
            {isUpcoming ? labels.upcoming : labels.past}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <time dateTime={event.startDate} className="text-sm text-green">
          {formatDateRange(locale, event.startDate, event.endDate)}
        </time>
        <h3 className="text-[clamp(1.3rem,2vw,1.7rem)] text-paper">
          <Link href={href(locale, `/tournaments/${event.slug}`)} className="transition-colors group-hover:text-green">
            {event.title}
          </Link>
        </h3>
        <p className="text-sm leading-[1.75] text-n-300">{event.summary}</p>
        {place && (
          <p className="text-xs text-n-500">
            {labels.location}: {place}
          </p>
        )}
        <Link href={href(locale, `/tournaments/${event.slug}`)} className="mt-auto inline-flex items-center gap-2 pt-2 text-sm text-green">
          {labels.details}
          <Arrow className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
