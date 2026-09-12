/**
 * Public origin of the site, without a trailing slash.
 *
 * An explicit NEXT_PUBLIC_SERVER_URL always wins. On Vercel the production
 * domain (or, for preview deployments, the deployment URL) is used so a deploy
 * works before any variable is configured; localhost otherwise.
 */
export function serverURL(): string {
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

/**
 * Origins a browser may call the API from (CORS + CSRF): the site itself plus
 * every URL Vercel gives this deployment, so the admin also works on preview
 * deployments and on the *.vercel.app domain next to a custom one.
 */
export function trustedOrigins(): string[] {
  const origins = new Set([serverURL()])
  for (const host of [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    if (host) origins.add(`https://${host}`)
  }
  return [...origins]
}

/** True when running on Vercel (build or runtime): the filesystem is read-only and functions are short-lived. */
export const onVercel = process.env.VERCEL === '1'
