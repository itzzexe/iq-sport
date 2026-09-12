import type { MetadataRoute } from 'next'
import { getSettings } from '@/lib/cms'
import { siteOrigin } from '@/lib/seo'

export const revalidate = 3600

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings('ar')
  const origin = siteOrigin(settings)

  if (settings.allowIndexing === false) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/next/'] }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
