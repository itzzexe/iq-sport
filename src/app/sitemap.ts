import type { MetadataRoute } from 'next'
import { DIVISIONS, SITE } from '@/data/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE.url, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...DIVISIONS.map((d) => ({
      url: `${SITE.url}/divisions/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
