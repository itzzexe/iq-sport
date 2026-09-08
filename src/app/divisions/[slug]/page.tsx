import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DivisionPage } from '@/components/DivisionPage'
import { DIVISIONS, SITE } from '@/data/site'
import { DIVISION_PAGES } from '@/data/pages'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return DIVISIONS.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const division = DIVISIONS.find((d) => d.slug === slug)
  if (!division) return {}
  const page = DIVISION_PAGES[slug]
  const title = `${division.title.ar} | ${division.title.en}`
  const description = page?.lede.ar ?? division.body.ar
  const url = `${SITE.url}/divisions/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${division.title.ar} — ${SITE.name.ar}`,
      description,
      url,
      type: 'website',
      images: [{ url: `/img/${division.image}.jpg`, width: 1600, height: 900, alt: division.title.en }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`/img/${division.image}.jpg`] },
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  if (!DIVISIONS.some((d) => d.slug === slug)) notFound()
  return <DivisionPage slug={slug} />
}
