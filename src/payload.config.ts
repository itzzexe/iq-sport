import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { seoPlugin } from '@payloadcms/plugin-seo'
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

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const SEO_TARGETS = {
  collections: ['divisions', 'tournaments'],
  globals: ['home', ...PAGE_GLOBALS.map((g) => g.slug)],
}

export default buildConfig({
  serverURL: SERVER_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  cors: [SERVER_URL],
  csrf: [SERVER_URL],

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
    client: {
      url: process.env.DATABASE_URL || 'file:./data/iq-sport.db',
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    },
    // One schema mechanism everywhere: the committed migrations in src/migrations.
    // `npm run dev` / `npm run build` apply them first (pre-scripts), and a
    // production server applies any pending ones on start-up.
    push: false,
    prodMigrations: migrations,
  }),

  plugins: [
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
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  onInit: ensureSeeded,
})
