import type { Metadata } from 'next'
import { About } from '@/components/home/About'
import { ContactSection } from '@/components/home/ContactSection'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { SectionsGrid } from '@/components/home/SectionsGrid'
import { JsonLd } from '@/components/ui/bits'
import { getBranches, getDivisions, getGlobal, getSettings } from '@/lib/cms'
import { makeT } from '@/lib/labels'
import { resolveLocale, type LangParams } from '@/lib/params'
import { buildMetadata, graph, webPageLd } from '@/lib/seo'

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const [settings, home] = await Promise.all([getSettings(locale), getGlobal('home', locale, 1)])
  return buildMetadata({ settings, locale, path: '/', meta: home.meta, image: home.hero.background })
}

export default async function HomePage({ params }: { params: LangParams }) {
  const locale = await resolveLocale(params)
  const [settings, home, branches, divisions] = await Promise.all([
    getSettings(locale),
    getGlobal('home', locale, 1),
    getBranches(locale, 0),
    getDivisions(locale, 0),
  ])
  const t = makeT(settings, locale)

  return (
    <>
      <Hero hero={home.hero} locale={locale} t={t} tagline={settings.tagline} />
      <Marquee items={divisions.map((d) => ({ key: d.slug, title: d.title, icon: d.icon }))} />
      <About about={home.about} siteName={settings.siteName} />
      <SectionsGrid sections={home.sections} locale={locale} />
      <ContactSection contact={home.contact} settings={settings} locale={locale} branches={branches} divisions={divisions} />
      <JsonLd data={graph(webPageLd(settings, locale, '/', home.meta?.title || settings.siteName, home.meta?.description || settings.defaultDescription))} />
    </>
  )
}
