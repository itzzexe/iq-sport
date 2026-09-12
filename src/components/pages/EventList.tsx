'use client'

import { useState } from 'react'
import type { Tournament } from '@/payload-types'
import type { Locale } from '@/lib/i18n'
import { EventCard, type EventLabels } from './cards'

type Kind = 'all' | 'tournament' | 'course'

/** Tournaments & courses with a kind filter and upcoming/past grouping. */
export function EventList({
  events,
  locale,
  labels,
  emptyMessage,
}: {
  events: Tournament[]
  locale: Locale
  labels: EventLabels & { all: string; tournaments: string; courses: string }
  emptyMessage?: string | null
}) {
  const [kind, setKind] = useState<Kind>('all')
  const now = Date.now()
  const visible = events.filter((e) => kind === 'all' || e.kind === kind)
  const upcoming = visible.filter((e) => new Date(e.endDate || e.startDate).getTime() >= now).sort((a, b) => a.startDate.localeCompare(b.startDate))
  const past = visible.filter((e) => new Date(e.endDate || e.startDate).getTime() < now)

  const tabs: { key: Kind; label: string }[] = [
    { key: 'all', label: labels.all },
    { key: 'tournament', label: labels.tournaments },
    { key: 'course', label: labels.courses },
  ]

  if (events.length === 0) {
    return (
      <p className="u-card max-w-[60ch] p-8 text-lg leading-relaxed text-n-300" role="status">
        {emptyMessage}
      </p>
    )
  }

  const group = (title: string, items: Tournament[], offset: number) =>
    items.length > 0 && (
      <section className="mt-10 first:mt-0" aria-label={title}>
        <h2 className="mb-6 flex items-center gap-3 text-sm text-n-500">
          <span className="h-px w-8 bg-green" />
          {title}
          <bdi dir="ltr" className="u-mono text-green">
            {String(items.length).padStart(2, '0')}
          </bdi>
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {items.map((e, i) => (
            <li key={e.id}>
              <EventCard event={e} locale={locale} labels={labels} index={offset + i} />
            </li>
          ))}
        </ul>
      </section>
    )

  return (
    <div>
      <div role="tablist" aria-label={labels.all} className="mb-10 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const on = kind === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setKind(tab.key)}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${on ? 'border-green bg-green text-ink' : 'border-white/15 text-n-300 hover:border-white/40 hover:text-paper'}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {group(labels.upcoming, upcoming, 0)}
      {group(labels.past, past, upcoming.length)}

      {visible.length === 0 && (
        <p className="text-n-400" role="status">
          {emptyMessage}
        </p>
      )}
    </div>
  )
}
