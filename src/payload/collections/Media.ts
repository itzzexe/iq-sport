import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { text } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'
import { L } from '../labels'

const dirname = path.dirname(fileURLToPath(import.meta.url))
// Uploads live in public/media by default; a server can keep them outside the
// release directory (MEDIA_DIR=/opt/iq-sport/media) so deploys never touch them.
const staticDir = process.env.MEDIA_DIR ? path.resolve(process.env.MEDIA_DIR) : path.resolve(dirname, '../../../public/media')

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: L('ملف وسائط', 'Media file'), plural: L('الوسائط', 'Media') },
  admin: { group: L('النظام', 'System'), defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    text('alt', 'النص البديل (وصف الصورة)', 'Alt text (image description)', {
      admin: {
        description: L(
          'يقرأه محرك البحث وقارئ الشاشة. اكتب ما تُظهره الصورة بجملة قصيرة.',
          'Read by search engines and screen readers. Describe what the image shows in one short sentence.',
        ),
      },
    }),
  ],
  upload: {
    // Files land in /public/media but are served by Payload at /api/media/file/<name>,
    // so uploads made after deployment work without a rebuild.
    staticDir,
    adminThumbnail: 'thumbnail',
    // Local disk only (on Vercel the Blob plugin takes over and links files directly).
    // Payload answers a file that is missing on disk with a generic 500; a plain
    // 404 is the truthful status and the one browsers and CDNs treat correctly.
    handlers: process.env.BLOB_READ_WRITE_TOKEN
      ? []
      : [
          (_req, { params }) => {
            const file = path.resolve(staticDir, params.filename)
            if (!file.startsWith(staticDir + path.sep)) return new Response('Bad request', { status: 400 })
            if (!existsSync(file)) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } })
            // present: fall through and let Payload stream it
          },
        ],
    focalPoint: true,
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'card', width: 800, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'wide', width: 1400, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'hero', width: 1920, formatOptions: { format: 'webp', options: { quality: 80 } } },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
        formatOptions: { format: 'jpeg', options: { quality: 85, mozjpeg: true } },
      },
    ],
  },
  hooks: revalidateCollection('media'),
}
