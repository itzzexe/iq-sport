import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Bookings } from './payload/collections/Bookings'
import { Branches } from './payload/collections/Branches'
import { Coaches } from './payload/collections/Coaches'
import { Divisions } from './payload/collections/Divisions'
import { Media } from './payload/collections/Media'
import { Tournaments } from './payload/collections/Tournaments'
import { Users } from './payload/collections/Users'
import { Home } from './payload/globals/Home'
import { PAGE_GLOBALS } from './payload/globals/pages'
import { Settings } from './payload/globals/Settings'
import { L } from './payload/labels'
import { ensureSeeded } from './payload/seed/ensure'
import { migrations } from './migrations'
import { onVercel, serverURL, trustedOrigins } from './lib/server-url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const SERVER_URL = serverURL()

// SQLite file locally; a remote libSQL/Turso database in production. The
// Vercel Marketplace's Turso integration provides TURSO_* names, so both work.
const CONFIGURED_DB_URL = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/iq-sport.db'
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined

// Uploads go to Vercel Blob whenever its token is present (Vercel injects it
// when a Blob store is connected); otherwise they stay on the local disk.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

/**
 * Demo mode: on Vercel without a Turso database the SQLite file is created and
 * seeded during the build, shipped with the functions, and copied to /tmp at
 * runtime (the only writable place). The site works, but changes made in the
 * admin are temporary — connect Turso (and Blob) for a permanent CMS.
 */
function resolveDatabaseURL(): string {
  if (!onVercel || !CONFIGURED_DB_URL.startsWith('file:')) return CONFIGURED_DB_URL
  const bundled = path.resolve(process.cwd(), CONFIGURED_DB_URL.slice('file:'.length))
  let writable = true
  try {
    fs.mkdirSync(path.dirname(bundled), { recursive: true })
    fs.accessSync(path.dirname(bundled), fs.constants.W_OK)
  } catch {
    writable = false
  }
  if (writable) return CONFIGURED_DB_URL // build step: create/seed the file in place
  const runtimeCopy = '/tmp/iq-sport.db'
  if (!fs.existsSync(runtimeCopy) && fs.existsSync(bundled)) fs.copyFileSync(bundled, runtimeCopy)
  return `file:${runtimeCopy}`
}

const DATABASE_URL = resolveDatabaseURL()

if (onVercel && CONFIGURED_DB_URL.startsWith('file:') && process.env.PAYLOAD_MIGRATING === 'true') {
  console.warn(
    '[db] وضع العرض: لا توجد قاعدة Turso، التعديلات من لوحة التحكم مؤقتة. ' +
      'Demo mode: no Turso database configured — admin edits are not permanent.',
  )
}

const SEO_TARGETS = {
  collections: ['divisions', 'tournaments'],
  globals: ['home', ...PAGE_GLOBALS.map((g) => g.slug)],
}

export default buildConfig({
  serverURL: SERVER_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  cors: trustedOrigins(),
  csrf: trustedOrigins(),

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    dateFormat: 'yyyy-MM-dd HH:mm',
    meta: {
      titleSuffix: ' — مجموعة العراق الرياضية',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '@/payload/components/Logo#Logo',
        Icon: '@/payload/components/Logo#Icon',
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  /* Arabic-first admin, with English available from the account menu. */
  i18n: {
    supportedLanguages: { ar, en },
    fallbackLanguage: 'ar',
  },

  /* Content is stored in both languages; Arabic is the default and the fallback. */
  localization: {
    locales: [
      { code: 'ar', label: L('العربية', 'Arabic'), rtl: true },
      { code: 'en', label: L('الإنجليزية', 'English') },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },

  collections: [Divisions, Branches, Coaches, Tournaments, Bookings, Media, Users],
  globals: [Settings, Home, ...PAGE_GLOBALS],

  editor: lexicalEditor({
    features: [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature({ enabledCollections: [] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  }),

  db: sqliteAdapter({
    client: { url: DATABASE_URL, authToken: DATABASE_AUTH_TOKEN },
    // One schema mechanism everywhere: the committed migrations in src/migrations.
    // `npm run dev` / `npm run build` apply them first (pre-scripts), and a
    // production server applies any pending ones on start-up.
    push: false,
    prodMigrations: migrations,
  }),

  plugins: [
    vercelBlobStorage({
      enabled: Boolean(BLOB_TOKEN),
      token: BLOB_TOKEN,
      // Public files are linked straight from the Blob CDN instead of being
      // streamed through a serverless function on every view.
      collections: { media: { disablePayloadAccessControl: true } },
      // Uploads go through the server on purpose: the plugin's direct-from-browser
      // mode stores the file under its original name before Payload de-duplicates
      // it, so a second "photo.jpg" would overwrite the first one's file and the
      // renamed document would point at nothing. (`addRandomSuffix` is no fix —
      // it mislabels the generated sizes.) The cost is Vercel's request limit,
      // enforced below as a clear 4 MB cap per image.
      clientUploads: false,
      addRandomSuffix: false,
      // Keep the schema identical with and without the plugin (local vs Vercel),
      // so one set of migrations serves both.
      alwaysInsertFields: true,
    }),
    seoPlugin({
      collections: SEO_TARGETS.collections,
      globals: SEO_TARGETS.globals,
      uploadsCollection: 'media',
      tabbedUI: true,
      // Meta title / description / image are written per language.
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => ('name' in field ? { ...field, localized: true } : field)),
      generateTitle: ({ doc, locale }) => {
        const title = (doc as { title?: string })?.title
        const brand = locale === 'en' ? 'IQ Sports Group' : 'مجموعة العراق الرياضية'
        return title ? `${title} | ${brand}` : brand
      },
      generateDescription: ({ doc }) => {
        const d = doc as { summary?: string; intro?: string; lede?: string }
        return (d?.summary || d?.lede || d?.intro || '').slice(0, 160)
      },
      generateURL: ({ doc, collectionConfig, globalConfig, locale }) => {
        const prefix = locale === 'en' ? '/en' : ''
        const slug = (doc as { slug?: string })?.slug
        if (collectionConfig?.slug && slug) return `${SERVER_URL}${prefix}/${collectionConfig.slug}/${slug}`
        if (globalConfig?.slug === 'home') return `${SERVER_URL}${prefix || '/'}`
        if (globalConfig?.slug) return `${SERVER_URL}${prefix}/${globalConfig.slug.replace(/-page$/, '')}`
        return SERVER_URL
      },
    }),
  ],

  graphQL: { disable: true },
  sharp,
  // Vercel functions reject request bodies above 4.5 MB, so the cap is lower there.
  upload: { limits: { fileSize: (onVercel ? 4 : 15) * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  onInit: ensureSeeded,
})
