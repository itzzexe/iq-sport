'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { submitBooking, type BookingErrorCode, type BookingField, type BookingState } from '@/actions/booking'
import type { Locale } from '@/lib/i18n'
import type { BookingLabelKey } from '@/lib/booking-labels'
import { Arrow } from '../ui/bits'

export type Option = { id: number; label: string; slug?: string | null }

type Labels = Record<BookingLabelKey, string>

const ERROR_LABEL: Record<BookingErrorCode, keyof Labels> = {
  required: 'formRequired',
  phoneInvalid: 'formPhoneInvalid',
  invalid: 'formRequired',
}

const INITIAL: BookingState = { status: 'idle' }

/**
 * Booking request form. Submits to a server action that stores the request in
 * the CMS (admins see it under "طلبات الحجز"); WhatsApp stays available as a
 * second channel with the same details pre-filled.
 */
export function BookingForm({
  locale,
  branches,
  divisions,
  labels,
  intro,
  success,
  whatsapp,
  siteName,
}: {
  locale: Locale
  branches: Option[]
  divisions: Option[]
  labels: Labels
  intro?: string | null
  success?: string | null
  whatsapp?: string | null
  siteName: string
}) {
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<HTMLParagraphElement>(null)
  const [state, action, pending] = useActionState(submitBooking, INITIAL)
  const [activity, setActivity] = useState('')
  const [branch, setBranch] = useState('')

  // Division / branch pages link here with ?activity=<slug> or ?branch=<slug>; pre-select them.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const d = divisions.find((x) => x.slug === q.get('activity'))
    const b = branches.find((x) => x.slug === q.get('branch'))
    if (d) setActivity(String(d.id))
    if (b) setBranch(String(b.id))
  }, [divisions, branches])

  useEffect(() => {
    if (state.status === 'error') alertRef.current?.focus()
    if (state.status === 'ok') formRef.current?.reset()
  }, [state])

  const err = (field: BookingField) => {
    const code = state.status === 'error' ? state.errors?.[field] : undefined
    return code ? labels[ERROR_LABEL[code]] : undefined
  }

  const whatsappHref = () => {
    if (!whatsapp) return undefined
    const fd = new FormData(formRef.current ?? undefined)
    const get = (k: string) => String(fd.get(k) ?? '').trim()
    const branch = branches.find((b) => String(b.id) === get('branch'))?.label
    const division = divisions.find((d) => String(d.id) === get('division'))?.label
    const lines = [
      locale === 'ar' ? `طلب حجز — ${siteName}` : `Booking request — ${siteName}`,
      get('name') && `${labels.formName}: ${get('name')}`,
      get('phone') && `${labels.formPhone}: ${get('phone')}`,
      branch && `${labels.formBranch}: ${branch}`,
      division && `${labels.formActivity}: ${division}`,
      get('date') && `${labels.formDate}: ${get('date')}`,
      get('notes') && `${labels.formNotes}: ${get('notes')}`,
    ].filter(Boolean)
    return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const field =
    'w-full border-b border-white/20 bg-transparent py-3 text-base text-paper outline-none transition-colors placeholder:text-n-600 focus:border-green'
  const label = 'block text-sm text-n-400'
  const errorText = 'mt-1 block text-sm text-orange'

  if (state.status === 'ok') {
    return (
      <div role="status" className="u-card flex flex-col items-start gap-4 p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-ink" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-lg text-paper">{success}</p>
      </div>
    )
  }

  const hasErrors = state.status === 'error' && !state.failed && state.errors && Object.keys(state.errors).length > 0

  return (
    <form ref={formRef} action={action} noValidate className="flex flex-col gap-6" aria-describedby={intro ? `${uid}-intro` : undefined}>
      {intro && (
        <p id={`${uid}-intro`} className="text-base text-n-300">
          {intro}
        </p>
      )}

      <p ref={alertRef} tabIndex={-1} role="alert" className={`text-sm text-orange ${hasErrors || state.failed ? '' : 'sr-only'}`}>
        {state.failed ? labels.formError : hasErrors ? labels.formFix : ''}
      </p>

      <input type="hidden" name="locale" value={locale} />
      {/* honeypot — hidden from people, tempting for bots */}
      <div className="absolute -start-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${uid}-name`}>
            {labels.formName} <span aria-hidden="true">*</span>
          </label>
          <input id={`${uid}-name`} name="name" className={field} autoComplete="name" required aria-invalid={Boolean(err('name'))} aria-describedby={err('name') ? `${uid}-name-err` : undefined} />
          {err('name') && <span id={`${uid}-name-err`} className={errorText}>{err('name')}</span>}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-phone`}>
            {labels.formPhone} <span aria-hidden="true">*</span>
          </label>
          <input id={`${uid}-phone`} name="phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="+964 7xx xxx xxxx" className={`${field} text-start`} required aria-invalid={Boolean(err('phone'))} aria-describedby={err('phone') ? `${uid}-phone-err` : undefined} />
          {err('phone') && <span id={`${uid}-phone-err`} className={errorText}>{err('phone')}</span>}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-branch`}>
            {labels.formBranch} <span aria-hidden="true">*</span>
          </label>
          <select id={`${uid}-branch`} name="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className={`${field} [&>option]:bg-n-900`} required aria-invalid={Boolean(err('branch'))} aria-describedby={err('branch') ? `${uid}-branch-err` : undefined}>
            <option value="">{labels.formChoose}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          {err('branch') && <span id={`${uid}-branch-err`} className={errorText}>{err('branch')}</span>}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-division`}>
            {labels.formActivity} <span aria-hidden="true">*</span>
          </label>
          <select id={`${uid}-division`} name="division" value={activity} onChange={(e) => setActivity(e.target.value)} className={`${field} [&>option]:bg-n-900`} required aria-invalid={Boolean(err('division'))} aria-describedby={err('division') ? `${uid}-division-err` : undefined}>
            <option value="">{labels.formChoose}</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          {err('division') && <span id={`${uid}-division-err`} className={errorText}>{err('division')}</span>}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-date`}>
            {labels.formDate}
          </label>
          <input id={`${uid}-date`} name="date" type="date" dir="ltr" className={`${field} text-start [color-scheme:dark]`} aria-invalid={Boolean(err('date'))} />
          {err('date') && <span className={errorText}>{err('date')}</span>}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-notes`}>
            {labels.formNotes}
          </label>
          <input id={`${uid}-notes`} name="notes" className={field} maxLength={1000} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="u-btn u-btn-primary disabled:opacity-60">
          {pending ? labels.formSubmitting : labels.formSubmit}
          <Arrow />
        </button>
        {whatsapp && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              const url = whatsappHref()
              if (url) window.open(url, '_blank', 'noopener,noreferrer')
            }}
            className="u-btn u-btn-ghost"
          >
            {labels.formWhatsApp}
          </a>
        )}
      </div>
    </form>
  )
}
