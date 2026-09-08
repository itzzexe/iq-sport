'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLang } from '@/lib/lang'
import { BRANCHES, CONTACT, DIVISIONS, SITE } from '@/data/site'

/**
 * Booking enquiry.
 *
 * There is no backend here, and pretending otherwise would produce a form that
 * silently drops real enquiries. Instead the form composes the message and
 * hands it to a channel the group already runs: WhatsApp by default, email as
 * the fallback. Everything the operator needs is in the message body, so the
 * enquiry survives the handoff intact.
 */

const WHATSAPP_NUMBER = CONTACT.phone.replace(/[^\d]/g, '')

type Fields = {
  name: string
  phone: string
  branch: string
  activity: string
  date: string
  notes: string
}

const EMPTY: Fields = { name: '', phone: '', branch: '', activity: '', date: '', notes: '' }

export function BookingForm() {
  const { t, lang } = useLang()
  const uid = useId()
  const [values, setValues] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [sent, setSent] = useState(false)
  const errorSummary = useRef<HTMLParagraphElement>(null)

  // Division pages link here with ?activity=<slug>; honour it so the reader
  // does not have to pick again what they just came from.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('activity')
    if (wanted && DIVISIONS.some((d) => d.slug === wanted)) {
      setValues((v) => (v.activity ? v : { ...v, activity: wanted }))
    }
  }, [])

  const copy = useMemo(
    () =>
      lang === 'ar'
        ? {
            name: 'الاسم',
            phone: 'رقم الهاتف',
            branch: 'الفرع',
            activity: 'النشاط',
            date: 'التاريخ المفضّل',
            notes: 'ملاحظات (اختياري)',
            choose: 'اختر…',
            submit: 'إرسال عبر واتساب',
            email: 'أو أرسل بالبريد الإلكتروني',
            required: 'هذا الحقل مطلوب',
            phoneInvalid: 'أدخل رقم هاتف صحيح',
            sent: 'تم فتح واتساب برسالة جاهزة. إن لم تُفتح، استخدم البريد الإلكتروني.',
            intro: 'املأ الطلب وسنعاود التواصل معك لتأكيد الحجز.',
          }
        : {
            name: 'Name',
            phone: 'Phone number',
            branch: 'Branch',
            activity: 'Activity',
            date: 'Preferred date',
            notes: 'Notes (optional)',
            choose: 'Choose…',
            submit: 'Send via WhatsApp',
            email: 'Or send by email',
            required: 'This field is required',
            phoneInvalid: 'Enter a valid phone number',
            sent: 'WhatsApp opened with your message ready. If it did not, use email instead.',
            intro: 'Fill in the request and we will come back to you to confirm.',
          },
    [lang],
  )

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  function validate(v: Fields) {
    const next: Partial<Record<keyof Fields, string>> = {}
    if (!v.name.trim()) next.name = copy.required
    // Deliberately permissive: Iraqi numbers get written +964…, 07…, with
    // spaces and dashes. Anything with 7+ digits is a plausible number.
    if (!v.phone.trim()) next.phone = copy.required
    else if ((v.phone.match(/\d/g) ?? []).length < 7) next.phone = copy.phoneInvalid
    if (!v.branch) next.branch = copy.required
    if (!v.activity) next.activity = copy.required
    return next
  }

  function buildMessage() {
    const branch = BRANCHES.find((b) => b.slug === values.branch)
    const activity = DIVISIONS.find((d) => d.slug === values.activity)
    const lines = [
      lang === 'ar' ? `طلب حجز — ${t(SITE.name)}` : `Booking request — ${t(SITE.name)}`,
      `${copy.name}: ${values.name}`,
      `${copy.phone}: ${values.phone}`,
      `${copy.branch}: ${branch ? t(branch.name) : '-'}`,
      `${copy.activity}: ${activity ? t(activity.title) : '-'}`,
      values.date ? `${copy.date}: ${values.date}` : null,
      values.notes.trim() ? `${copy.notes}: ${values.notes.trim()}` : null,
    ].filter(Boolean)
    return lines.join('\n')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = validate(values)
    setErrors(next)
    if (Object.keys(next).length > 0) {
      errorSummary.current?.focus()
      return
    }
    const message = buildMessage()
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  function mailtoHref() {
    const subject = lang === 'ar' ? 'طلب حجز' : 'Booking request'
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`
  }

  const field = 'w-full border-b border-white/20 bg-transparent py-3 text-sm text-paper outline-none transition-colors placeholder:text-n-600 focus:border-green'
  const label = 'u-mono block text-[0.6rem] text-n-500'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6" aria-labelledby={`${uid}-legend`}>
      <p id={`${uid}-legend`} className="text-sm text-n-400">
        {copy.intro}
      </p>

      <p
        ref={errorSummary}
        tabIndex={-1}
        role="alert"
        className={`text-sm text-orange ${Object.keys(errors).length ? '' : 'sr-only'}`}
      >
        {Object.keys(errors).length > 0
          ? lang === 'ar'
            ? 'يرجى إكمال الحقول المطلوبة.'
            : 'Please complete the required fields.'
          : ''}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${uid}-name`}>
            {copy.name} *
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            className={field}
            value={values.name}
            onChange={set('name')}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            required
          />
          {errors.name && (
            <span id={`${uid}-name-err`} className="mt-1 block text-xs text-orange">
              {errors.name}
            </span>
          )}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-phone`}>
            {copy.phone} *
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            className={`${field} text-start`}
            value={values.phone}
            onChange={set('phone')}
            autoComplete="tel"
            placeholder="+964 7xx xxx xxxx"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
            required
          />
          {errors.phone && (
            <span id={`${uid}-phone-err`} className="mt-1 block text-xs text-orange">
              {errors.phone}
            </span>
          )}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-branch`}>
            {copy.branch} *
          </label>
          <select
            id={`${uid}-branch`}
            name="branch"
            className={`${field} [&>option]:bg-n-900`}
            value={values.branch}
            onChange={set('branch')}
            aria-invalid={Boolean(errors.branch)}
            aria-describedby={errors.branch ? `${uid}-branch-err` : undefined}
            required
          >
            <option value="">{copy.choose}</option>
            {BRANCHES.map((b) => (
              <option key={b.slug} value={b.slug}>
                {t(b.name)}
              </option>
            ))}
          </select>
          {errors.branch && (
            <span id={`${uid}-branch-err`} className="mt-1 block text-xs text-orange">
              {errors.branch}
            </span>
          )}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-activity`}>
            {copy.activity} *
          </label>
          <select
            id={`${uid}-activity`}
            name="activity"
            className={`${field} [&>option]:bg-n-900`}
            value={values.activity}
            onChange={set('activity')}
            aria-invalid={Boolean(errors.activity)}
            aria-describedby={errors.activity ? `${uid}-activity-err` : undefined}
            required
          >
            <option value="">{copy.choose}</option>
            {DIVISIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {t(d.title)}
              </option>
            ))}
          </select>
          {errors.activity && (
            <span id={`${uid}-activity-err`} className="mt-1 block text-xs text-orange">
              {errors.activity}
            </span>
          )}
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-date`}>
            {copy.date}
          </label>
          <input
            id={`${uid}-date`}
            name="date"
            type="date"
            dir="ltr"
            className={`${field} text-start [color-scheme:dark]`}
            value={values.date}
            onChange={set('date')}
          />
        </div>

        <div>
          <label className={label} htmlFor={`${uid}-notes`}>
            {copy.notes}
          </label>
          <input id={`${uid}-notes`} name="notes" className={field} value={values.notes} onChange={set('notes')} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-green px-7 py-4 text-ink"
        >
          <span className="u-mono relative z-10 text-[0.7rem]">{copy.submit}</span>
          <span className="relative z-10 text-lg leading-none transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {lang === 'ar' ? '←' : '→'}
          </span>
          <span className="absolute inset-0 origin-left scale-x-0 bg-volt transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
        </button>

        <a
          href={mailtoHref()}
          className="u-mono rounded-full border border-white/20 px-7 py-4 text-[0.7rem] text-n-300 transition-colors hover:border-green hover:text-green"
        >
          {copy.email}
        </a>
      </div>

      {sent && (
        <p role="status" className="text-sm text-green">
          {copy.sent}
        </p>
      )}
    </form>
  )
}
