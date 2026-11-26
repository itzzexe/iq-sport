import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const dirname = path.dirname(fileURLToPath(import.meta.url))

function emulatorPattern() {
  const base = process.env.STORAGE_VERCEL_BLOB_BASE_URL
  if (!base) return []
  const u = new URL(base)
  return [{ protocol: u.protocol.replace(':', '') as 'http' | 'https', hostname: u.hostname, port: u.port }]
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Demo mode on Vercel (no Turso): ship the build-time SQLite database and
  // seeded images with the server functions.
  outputFileTracingIncludes: { '/**': ['./data/iq-sport.db', './public/media/**'] },
  compress: true,
  images: {
    // Uploads are served by Payload from this route; Next.js optimises them on demand.
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/img/**' }, { pathname: '/brand/**' }, { pathname: '/**' }],
    // Uploads on Vercel live in Vercel Blob and are linked from its CDN
    // (or from a local Blob emulator while testing that setup).
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }, ...emulatorPattern()],
    // A Blob emulator runs on localhost, which the optimizer's SSRF guard would refuse.
    dangerouslyAllowLocalIP: Boolean(process.env.STORAGE_VERCEL_BLOB_BASE_URL),
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Required on Windows for Payload's admin styles under Turbopack.
  sassOptions: { loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'] },
  turbopack: { root: path.resolve(dirname) },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Only honoured over HTTPS; harmless on localhost.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
