'use client'

import { useRowLabel } from '@payloadcms/ui'

const KEYS = ['title', 'label', 'name', 'text', 'keyword', 'platform', 'page', 'value', 'url']

/** Shows something meaningful on collapsed array rows instead of "Row 1". */
export const RowLabel = () => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const raw = KEYS.map((k) => data?.[k]).find((v) => typeof v === 'string' && v.trim().length > 0) as
    | string
    | undefined
  const label = raw ? (raw.length > 70 ? `${raw.slice(0, 70)}…` : raw) : `#${(rowNumber ?? 0) + 1}`
  return <span>{label}</span>
}
