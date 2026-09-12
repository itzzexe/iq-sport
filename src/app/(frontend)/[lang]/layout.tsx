import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { MotionProviders } from '@/components/motion/Providers'
import { SiteScene } from '@/components/motion/SceneMount'
import { Preloader } from '@/components/Preloader'
import { JsonLd } from '@/components/ui/bits'
import { getDivisions, getSettings } from '@/lib/cms'
import { fontClassNames } from '@/lib/fonts'
import { dirOf, isLocale, LOCALES } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { mediaUrl } from '@/lib/media'
import { resolveLocale, type LangParams } from '@/lib/params'
import { graph, organizationLd, siteOrigin, websiteLd } from '@/lib/seo'
import '../globals.css'

/**
 * Both locales are prerendered; anything else is rejected by `resolveLocale`.
 * Note: `dynamicParams` is deliberately left on (default) — turning it off here
 * would cascade to every child route and block on-demand rendering of pages
 * published after the build (and regeneration after a revalidation).
 */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const settings = await getSettings(lang)
  return {
    metadataBase: new URL(siteOrigin(settings)),
    applicationName: settings.siteName,
    keywords: (settings.keywords ?? []).map((k) => k.keyword).filter(Boolean),
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-icon.png' }],
    },
    verification: settings.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, divisions, { isEnabled: preview }] = await Promise.all([getSettings(locale), getDivisions(locale, 1), draftMode()])
  const t = makeT(settings, locale)
  // Facility panels for the 3D ring — one per published division with an image.
  const panels = divisions
    .map((d) => ({ slug: d.slug, image: mediaUrl(d.image, 'card') ?? '' }))
    .filter((p) => p.image)

  return (
    <html lang={locale} dir={dirOf(locale)} className={fontClassNames} suppressHydrationWarning>
      <body id="top" className="u-grain">
        <MotionProviders locale={locale}>
          {preview && <LivePreviewListener />}
          <SiteScene panels={panels} divisions={divisions.map((d) => ({ slug: d.slug, icon: d.icon }))} />
          <Header settings={settings} locale={locale} />
          <main id="main" className="relative">
            <Preloader locale={locale} siteName={settings.siteName} loadingLabel={t('loading')} />
            {children}
          </main>
          <Footer settings={settings} locale={locale} />
        </MotionProviders>
        {/* Structured data at the end of <body>: browser extensions inject scripts at the
            top of <head>, which was producing spurious hydration mismatches there. */}
        <JsonLd data={graph(organizationLd(settings, locale), websiteLd(settings, locale))} />
      </body>
    </html>
  )
}
