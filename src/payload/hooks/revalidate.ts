import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Content changed → purge the Next.js cache.
 *
 * The site is small and heavily cross-linked (a branch name shows up on the
 * home page, the branches page, every division page, the booking form and the
 * sitemap), so targeted invalidation would be fragile. Every write purges the
 * collection's tag *and* the whole route tree. That costs one re-render per
 * page on the next visit and guarantees nothing stale is ever served.
 *
 * Skipped when the write comes from the seed script (`context.disableRevalidate`),
 * and tolerant of running outside a request scope (CLI seeding) where the Next
 * cache APIs throw.
 */
export function purge(tag: string, req: PayloadRequest) {
  if (req.context?.disableRevalidate) return
  try {
    revalidateTag(tag, 'max')
    revalidateTag('site', 'max')
    revalidatePath('/', 'layout')
    req.payload.logger.info(`revalidated: ${tag}`)
  } catch {
    // Not inside a Next.js request (e.g. CLI) — nothing to purge.
  }
}

export const revalidateCollection = (tag: string) => {
  const afterChange: CollectionAfterChangeHook = ({ doc, req }) => {
    purge(tag, req)
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
    purge(tag, req)
    return doc
  }
  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

export const revalidateGlobal = (tag: string) => {
  const afterChange: GlobalAfterChangeHook = ({ doc, req }) => {
    purge(tag, req)
    return doc
  }
  return { afterChange: [afterChange] }
}
