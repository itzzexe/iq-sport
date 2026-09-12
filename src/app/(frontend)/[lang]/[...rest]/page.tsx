import { notFound } from 'next/navigation'

/**
 * With more than one root layout in the app (site + Payload admin) there can be
 * no top-level not-found page, so unmatched URLs under a locale are caught here
 * and handed to the locale's not-found boundary.
 */
export default function CatchAll() {
  notFound()
}
