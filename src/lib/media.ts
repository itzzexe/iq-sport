import type { Media } from '@/payload-types'

export type MediaRef = number | Media | null | undefined
export type MediaSize = 'thumbnail' | 'card' | 'wide' | 'hero' | 'og'

/** True when a relationship was populated (depth ≥ 1) rather than left as an id. */
export const isMedia = (m: MediaRef): m is Media => Boolean(m) && typeof m === 'object'

/** Best URL for a rendering size; falls back to the original upload. */
export function mediaUrl(m: MediaRef, size?: MediaSize): string | null {
  if (!isMedia(m)) return null
  const sized = size ? m.sizes?.[size] : undefined
  const raw = sized?.url || m.url
  if (!raw) return null
  // Payload prefixes URLs with serverURL; keep them relative so next/image treats
  // them as local files (no remotePatterns, no self-fetch over the network).
  const url = raw.startsWith('http') ? toRelative(raw) : raw
  // cache-bust when the file is replaced in the CMS but keeps its name
  const stamp = m.updatedAt ? `?v=${encodeURIComponent(new Date(m.updatedAt).getTime().toString(36))}` : ''
  return `${url}${stamp}`
}

function toRelative(absolute: string) {
  try {
    const u = new URL(absolute)
    return `${u.pathname}${u.search}`
  } catch {
    return absolute
  }
}

export function mediaDims(m: MediaRef, size?: MediaSize): { width: number; height: number } {
  if (!isMedia(m)) return { width: 1600, height: 900 }
  const sized = size ? m.sizes?.[size] : undefined
  const width = sized?.width || m.width || 1600
  const height = sized?.height || m.height || 900
  return { width, height }
}

export const mediaAlt = (m: MediaRef, fallback = '') => (isMedia(m) && m.alt ? m.alt : fallback)

/** Focal point (0–100) → CSS object-position. */
export function mediaPosition(m: MediaRef) {
  if (!isMedia(m)) return undefined
  const x = typeof m.focalX === 'number' ? m.focalX : 50
  const y = typeof m.focalY === 'number' ? m.focalY : 50
  return `${x}% ${y}%`
}
