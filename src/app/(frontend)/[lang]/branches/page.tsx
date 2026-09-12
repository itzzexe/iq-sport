import type { Metadata } from 'next'
import { BranchMap } from '@/components/pages/BranchMap'
import { Reveal } from '@/components/ui/Reveal'
import { BackHome, JsonLd, PageHero } from '@/components/ui/bits'
import { getBranches, getGlobal, getSettings } from '@/lib/cms'
import { makeT } from '@/lib/labels'
import { resolveLocale, type LangParams } from '@/lib/params'
import { breadcrumbLd, buildMetadata, graph, siteOrigin, webPageLd } from '@/lib/seo'

const PATH = '/branches'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, page] = await Promise.all([getSettings(locale), getGlobal('branches-page', locale, 1)])
  return buildMetadata({ settings, locale, path: PATH, title: page.title, description: page.intro, meta: page.meta, image: page.mapImage })
}

export default async function BranchesPage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, page, branches] = await Promise.all([
    getSettings(locale),
    getGlobal('branches-page', locale, 1),
    getBranches(locale, 1),
  ])
  const t = makeT(settings, locale)
  const origin = siteOrigin(settings)

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} />

      <Reveal className="shell py-[clamp(3rem,8vh,6rem)]">
        <BranchMap
          branches={branches}
          mapImage={page.mapImage}
          caption={page.mapCaption}
          locale={locale}
          labels={{
            facilities: t('facilities'),
            bookHere: t('bookHere'),
            viewOnMap: t('viewOnMap'),
            call: t('call'),
            whatsapp: t('whatsapp'),
            hours: t('hours'),
          }}
        />
      </Reveal>

      <BackHome locale={locale} t={t} />

      <JsonLd
        data={graph(
          webPageLd(settings, locale, PATH, page.title, page.intro),
          breadcrumbLd(settings, locale, [{ name: settings.siteName, path: '/' }, { name: page.title, path: PATH }]),
          ...branches.map((b) => ({
            '@type': 'SportsActivityLocation',
            '@id': `${origin}/branches#${b.slug}`,
            name: `${settings.siteName} — ${b.title}`,
            parentOrganization: { '@id': `${origin}/#organization` },
            telephone: b.phone || settings.phone || undefined,
            url: `${origin}${locale === 'en' ? '/en' : ''}${PATH}`,
            hasMap: b.mapsUrl || undefined,
            openingHours: b.hours || undefined,
            address: {
              '@type': 'PostalAddress',
              streetAddress: b.address || b.title,
              addressLocality: b.area || settings.city || undefined,
              addressCountry: 'IQ',
            },
            geo:
              typeof b.geo?.lat === 'number' && typeof b.geo?.lng === 'number'
                ? { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng }
                : undefined,
            amenityFeature: (b.facilities ?? []).map((f) => ({ '@type': 'LocationFeatureSpecification', name: f.label, value: true })),
          })),
        )}
      />
    </>
  )
}
