'use server'

import { headers } from 'next/headers'
import { payloadClient } from '@/lib/cms'
import { isLocale } from '@/lib/i18n'

export type BookingField = 'name' | 'phone' | 'branch' | 'division' | 'date' | 'notes'
export type BookingErrorCode = 'required' | 'phoneInvalid' | 'invalid'
export type BookingState = {
  status: 'idle' | 'ok' | 'error'
  errors?: Partial<Record<BookingField, BookingErrorCode>>
  /** set when the request could not be stored at all */
  failed?: boolean
}

/* Very small per-process throttle: 6 requests per 10 minutes per IP. */
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 6
const hits = new Map<string, number[]>()
function throttled(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > LIMIT
}

const str = (v: FormDataEntryValue | null, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const id = (v: FormDataEntryValue | null) => {
  const n = Number(str(v, 20))
  return Number.isInteger(n) && n > 0 ? n : null
}

/**
 * Stores a booking request in the CMS (collection "bookings"). This is the only
 * way a booking can be created — the collection's public `create` access is off.
 */
export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  // Honeypot: real people never fill a field they cannot see.
  if (str(formData.get('website'))) return { status: 'ok' }

  const name = str(formData.get('name'), 120)
  const phone = str(formData.get('phone'), 40)
  const branch = id(formData.get('branch'))
  const division = id(formData.get('division'))
  const date = str(formData.get('date'), 10)
  const notes = str(formData.get('notes'), 1000)
  const localeRaw = str(formData.get('locale'), 2)
  const locale = isLocale(localeRaw) ? localeRaw : 'ar'

  const errors: BookingState['errors'] = {}
  if (name.length < 2) errors.name = 'required'
  if (!phone) errors.phone = 'required'
  else if ((phone.match(/\d/g) ?? []).length < 7) errors.phone = 'phoneInvalid'
  if (!branch) errors.branch = 'required'
  if (!division) errors.division = 'required'
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = 'invalid'
  if (Object.keys(errors).length > 0) return { status: 'error', errors }

  const h = await headers()
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'local').split(',')[0].trim()
  if (throttled(ip)) return { status: 'error', failed: true }

  try {
    const payload = await payloadClient()
    // Only accept ids that really exist and are published.
    const [b, d] = await Promise.all([
      payload.find({ collection: 'branches', where: { id: { equals: branch } }, limit: 1, depth: 0, overrideAccess: false }),
      payload.find({ collection: 'divisions', where: { id: { equals: division } }, limit: 1, depth: 0, overrideAccess: false }),
    ])
    if (b.totalDocs === 0) return { status: 'error', errors: { branch: 'invalid' } }
    if (d.totalDocs === 0) return { status: 'error', errors: { division: 'invalid' } }

    await payload.create({
      collection: 'bookings',
      data: {
        name,
        phone,
        branch: branch!,
        division: division!,
        date: date ? `${date}T12:00:00.000Z` : undefined,
        notes: notes || undefined,
        status: 'new',
        locale,
        source: 'website',
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    return { status: 'ok' }
  } catch (err) {
    console.error('[booking] failed to store request', err)
    return { status: 'error', failed: true }
  }
}
