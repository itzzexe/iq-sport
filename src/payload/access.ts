import type { Access } from 'payload'

/** Anyone, including anonymous website visitors. */
export const anyone: Access = () => true

/** Only a logged-in admin user. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * Admins see everything; the public only sees published documents.
 * Used on every collection that has drafts enabled.
 */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/** Nobody through the API — the document is only ever created server-side (bookings). */
export const nobody: Access = () => false
