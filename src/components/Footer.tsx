import Link from 'next/link'
import type { Setting } from '@/payload-types'
import { pageHref, type Locale } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { LogoLockup, LogoMark } from './brand/Logo'
import { ScrollMeter } from './motion/Parallax'

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  snapchat: 'Snapchat',
  whatsapp: 'WhatsApp',
  other: 'Link',
}

export function Footer({ settings, locale }: { settings: Setting; locale: Locale }) {
  const t = makeT(settings, locale)
  const year = new Date().getFullYear()
  const nav = (settings.nav ?? []).filter((n) => n.page && n.label)
  const socials = (settings.socials ?? []).filter((s) => s.url)

  return (
    <footer className="relative border-t u-hairline bg-n-950">
      <ScrollMeter />
      <div className="shell grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <LogoLockup className="h-8 w-auto text-paper" title={settings.siteName} />
          {settings.footerText && (
            <p className="mt-6 max-w-[44ch] text-sm leading-[1.8] text-n-400">{settings.footerText}</p>
          )}
        </div>

        <nav className="lg:col-span-3" aria-label={t('footerNav')}>
          <h2 className="u-mono text-[0.65rem] text-n-500">{t('footerNav')}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {nav.map((n) => (
              <li key={n.id ?? n.page}>
                <Link href={pageHref(locale, n.page)} className="text-sm text-n-300 transition-colors hover:text-green">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="u-mono text-[0.65rem] text-n-500">{t('phone')} / {t('email')}</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} dir="ltr" className="inline-block text-paper transition-colors hover:text-green">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} dir="ltr" className="inline-block text-paper transition-colors hover:text-green">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && <li className="text-n-400">{settings.address}</li>}
          </ul>

          {socials.length > 0 && (
            <>
              <h2 className="u-mono mt-8 text-[0.65rem] text-n-500">{t('follow')}</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {socials.map((s) => (
                  <li key={s.id ?? s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="text-sm text-n-300 transition-colors hover:text-green"
                    >
                      {PLATFORM_LABEL[s.platform] ?? s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="shell flex flex-col gap-3 border-t u-hairline py-6 text-[0.8rem] text-n-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © <bdi dir="ltr">{year}</bdi> {settings.copyright || `${settings.siteName} — ${t('rights')}`}
        </p>
        <a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-green">
          <LogoMark className="w-6 text-green" />
          <span>{t('backToTop')}</span>
        </a>
      </div>
    </footer>
  )
}
