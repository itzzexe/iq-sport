import type { MetadataRoute } from 'next'
import { getSettings } from '@/lib/cms'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings('ar')
  return {
    name: settings.siteName,
    short_name: settings.shortName || settings.siteName,
    description: settings.defaultDescription || undefined,
    start_url: '/',
    display: 'standalone',
    lang: 'ar',
    dir: 'rtl',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  }
}
