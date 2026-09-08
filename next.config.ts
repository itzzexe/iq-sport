import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2048],
  },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'gsap'],
  },
  async headers() {
    const oneYearImmutable = 'public, max-age=31536000, immutable'
    return [
      {
        source: '/video/:path*',
        headers: [{ key: 'Cache-Control', value: oneYearImmutable }],
      },
      {
        source: '/img/:path*',
        headers: [{ key: 'Cache-Control', value: oneYearImmutable }],
      },
      {
        source: '/brand/:path*',
        headers: [{ key: 'Cache-Control', value: oneYearImmutable }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

export default nextConfig
