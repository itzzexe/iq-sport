import { NotFoundClient, type NotFoundCopy } from '@/components/NotFoundClient'
import { getSettings } from '@/lib/cms'
import { LOCALES, type Locale } from '@/lib/i18n'
import { makeT } from '@/lib/labels'

/**
 * Rendered for unknown URLs (via the [...rest] catch-all) and for notFound()
 * calls inside this locale. Copy for both languages is prepared on the server;
 * the client picks the one matching the URL — no request APIs, so pages that
 * include this boundary can still be prerendered.
 */
export default async function NotFound() {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => {
      const t = makeT(await getSettings(locale), locale)
      return [locale, { title: t('notFoundTitle'), body: t('notFoundBody'), back: t('backHome') }] as const
    }),
  )
  return <NotFoundClient copy={Object.fromEntries(entries) as Record<Locale, NotFoundCopy>} />
}
