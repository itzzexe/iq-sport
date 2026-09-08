import type { Metadata, Viewport } from 'next'
import { Archivo, Cairo, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Sprite } from '@/components/Sprite'
import { Providers } from './providers'
import { SITE, CONTACT, BRANCHES, DIVISIONS } from '@/data/site'

/**
 * Type stack.
 *
 * The guideline specifies Varien for display and IBM Plex Sans Arabic for
 * Arabic body copy, with DIN Arabic Black for Arabic headings. Plex Arabic is
 * available on Google Fonts and is used exactly as specified; Varien and DIN
 * Arabic are licensed desktop faces, so the two closest open equivalents stand
 * in for them on the web — Archivo for the Latin display lockups and Cairo for
 * Arabic headings. Swap in the licensed webfonts here and nothing else changes.
 */
/* Only the weights the stylesheet actually asks for are downloaded. Three
   families with Arabic coverage add up fast — the full ranges cost ~190 kB. */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['700', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600'],
  variable: '--font-plex-ar',
  display: 'swap',
})

const description =
  'مجموعة العراق الرياضية — شركة عراقية متخصصة في إنشاء وإدارة وتشغيل الأقسام والأكاديميات الرياضية: البادل، كرة القدم، التنس، اللياقة البدنية والسباحة، بأربعة فروع في بغداد.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name.ar} | IQ Sports Group`,
    template: `%s | ${SITE.name.ar}`,
  },
  description,
  applicationName: SITE.name.en,
  keywords: [
    'مجموعة العراق الرياضية',
    'IQ Sports Group',
    'بادل بغداد',
    'PADEL IQ',
    'جيم بغداد',
    'أكاديمية رياضية العراق',
    'padel Baghdad',
    'gym Baghdad',
    'sports academy Iraq',
  ],
  authors: [{ name: SITE.name.en }],
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    alternateLocale: ['en_IQ'],
    url: SITE.url,
    siteName: SITE.name.ar,
    title: `${SITE.name.ar} | IQ Sports Group`,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name.ar} | IQ Sports Group`,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png' }],
  },
  alternates: {
    canonical: SITE.url,
    languages: { 'ar-IQ': SITE.url, 'en-IQ': `${SITE.url}?lang=en` },
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/** Structured data so the four branches surface as real places in search. */
function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE.url}#organization`,
        name: SITE.name.en,
        alternateName: SITE.name.ar,
        url: SITE.url,
        description,
        email: CONTACT.email,
        telephone: CONTACT.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE.city.en,
          addressCountry: 'IQ',
          streetAddress: CONTACT.address.en,
        },
        sameAs: CONTACT.socials.map((s) => s.href),
      },
      ...BRANCHES.map((branch) => ({
        '@type': 'SportsActivityLocation',
        '@id': `${SITE.url}#branch-${branch.slug}`,
        name: `${SITE.name.en} — ${branch.name.en}`,
        parentOrganization: { '@id': `${SITE.url}#organization` },
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE.city.en,
          addressCountry: 'IQ',
          streetAddress: branch.name.en,
        },
        amenityFeature: branch.facilities.map((f) => ({
          '@type': 'LocationFeatureSpecification',
          name: f.en,
          value: true,
        })),
      })),
      {
        '@type': 'ItemList',
        '@id': `${SITE.url}#divisions`,
        name: 'Divisions',
        itemListElement: DIVISIONS.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: d.title.en,
          description: d.body.en,
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${archivo.variable} ${cairo.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <StructuredData />
      </head>
      <body className="u-grain">
        <Sprite />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
