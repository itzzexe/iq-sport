import type { Setting } from '@/payload-types'
import { pageHref, type Locale } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { HeaderClient, type NavItem } from './HeaderClient'

export function Header({ settings, locale }: { settings: Setting; locale: Locale }) {
  const t = makeT(settings, locale)
  const items: NavItem[] = (settings.nav ?? [])
    .filter((n) => n.page && n.label)
    .map((n) => ({ href: pageHref(locale, n.page), label: n.label, page: n.page as string }))

  return (
    <HeaderClient
      locale={locale}
      items={items}
      siteName={settings.siteName}
      labels={{
        book: t('bookNow'),
        menu: t('menu'),
        close: t('close'),
        switchLanguage: t('switchLanguage'),
        skip: t('skipToContent'),
      }}
      bookHref={pageHref(locale, 'contact')}
    />
  )
}
