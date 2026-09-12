import type { Field, GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { image, items, number, pageHeading, plain, text, textarea } from '../fields'
import { revalidateGlobal } from '../hooks/revalidate'
import { L } from '../labels'
import { globalPreview } from '../preview'

/**
 * One global per inner page. Each carries its own heading block, page-specific
 * content and (via the SEO plugin) its own meta title/description/image.
 */
const page = (slug: string, ar: string, en: string, path: string, fields: Field[]): GlobalConfig => ({
  slug,
  label: L(ar, en),
  admin: { group: L('الصفحات', 'Pages'), livePreview: globalPreview(path) },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [{ label: L('المحتوى', 'Content'), fields: [...pageHeading(), ...fields] }],
    },
  ],
  hooks: revalidateGlobal(`global_${slug}`),
})

export const DivisionsPage = page('divisions-page', 'صفحة الأقسام', 'Divisions page', '/divisions', [])

export const BranchesPage = page('branches-page', 'صفحة الفروع', 'Branches page', '/branches', [
  image('mapImage', 'صورة الخريطة', 'Map artwork', {
    admin: { description: L('خريطة بغداد التي تُرسم عليها نقاط الفروع', 'The Baghdad map the branch pins are placed on') },
  }),
  text('mapCaption', 'تعليق الخريطة', 'Map caption'),
])

export const StatisticsPage = page('statistics-page', 'صفحة الإحصائيات', 'Statistics page', '/statistics', [
  items('stats', ['إحصائية', 'Statistic'], ['الإحصائيات', 'Statistics'], [
    {
      type: 'row',
      fields: [
        number('value', 'الرقم', 'Value', { required: true, admin: { width: '40%' } }),
        plain('suffix', 'لاحقة', 'Suffix', { admin: { width: '20%', description: L('مثل +', 'e.g. +') } }),
        text('label', 'الوصف', 'Label', { required: true, admin: { width: '40%' } }),
      ],
    },
  ]),
  {
    name: 'rushHours',
    type: 'group',
    label: L('ساعات الذروة', 'Peak hours'),
    fields: [
      {
        type: 'row',
        fields: [
          text('label', 'العنوان', 'Label', { admin: { width: '50%' } }),
          plain('value', 'القيمة', 'Value', { admin: { width: '50%', placeholder: '4 AM — 4 PM' } }),
        ],
      },
    ],
  },
  text('whyEyebrow', 'عنوان قسم «لماذا نحن»', '"Why us" eyebrow'),
  items('reasons', ['سبب', 'Reason'], ['لماذا مجموعة العراق الرياضية', 'Why IQ Sports Group'], [
    text('title', 'العنوان', 'Title', { required: true }),
    textarea('body', 'الوصف', 'Description'),
  ]),
  {
    name: 'closing',
    type: 'group',
    label: L('البطاقة الختامية (الخضراء)', 'Closing (green) card'),
    fields: [text('title', 'العنوان', 'Title'), textarea('body', 'النص', 'Body')],
  },
])

export const TeamPage = page('team-page', 'صفحة الكادر التدريبي', 'Coaching staff page', '/team', [
  items('summary', ['بند', 'Item'], ['ملخّص الفريق', 'Team summary'], [
    {
      type: 'row',
      fields: [
        text('label', 'العنوان', 'Label', { required: true, admin: { width: '50%' } }),
        text('value', 'القيمة', 'Value', { required: true, admin: { width: '50%' } }),
      ],
    },
  ]),
])

export const TournamentsPage = page(
  'tournaments-page',
  'صفحة البطولات والدورات',
  'Tournaments & courses page',
  '/tournaments',
  [
    textarea('emptyMessage', 'الرسالة عند عدم وجود عناصر منشورة', 'Message shown when nothing is published'),
  ],
)

export const VisionPage = page('vision-page', 'صفحة الرؤية', 'Vision page', '/vision', [
  textarea('statement', 'نص الرؤية', 'Vision statement', { required: true }),
  image('image', 'الصورة', 'Image'),
  textarea('mission', 'الرسالة (اختياري)', 'Mission (optional)'),
  items('values', ['قيمة', 'Value'], ['القيم', 'Values'], [
    text('title', 'العنوان', 'Title', { required: true }),
    textarea('body', 'الوصف', 'Description'),
  ]),
])

export const PAGE_GLOBALS = [DivisionsPage, BranchesPage, StatisticsPage, TeamPage, TournamentsPage, VisionPage]
