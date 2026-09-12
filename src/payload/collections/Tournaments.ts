import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { checkbox, image, items, plain, relation, select, text, textarea } from '../fields'
import { slug } from '../fields/slug'
import { revalidateCollection } from '../hooks/revalidate'
import { L } from '../labels'
import { collectionPreview } from '../preview'

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  labels: {
    singular: L('بطولة / دورة', 'Tournament / course'),
    plural: L('البطولات والدورات التدريبية', 'Tournaments & courses'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'startDate', 'division', '_status'],
    group: L('المحتوى', 'Content'),
    livePreview: collectionPreview('/tournaments'),
    description: L(
      'البطولات السابقة والقادمة والدورات التدريبية. ما لم يُنشر يبقى مسودة لا تظهر في الموقع.',
      'Past and upcoming tournaments plus training courses. Unpublished items stay as drafts and never show on the site.',
    ),
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: '-startDate',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('المحتوى', 'Content'),
          fields: [
            text('title', 'العنوان', 'Title', { required: true }),
            textarea('summary', 'ملخّص قصير', 'Short summary', {
              required: true,
              admin: { description: L('يظهر في البطاقة وفي نتائج البحث', 'Shown on the card and in search results') },
            }),
            image('cover', 'صورة الغلاف', 'Cover image', { required: true }),
            { name: 'body', type: 'richText', localized: true, label: L('التفاصيل', 'Details') },
            items('highlights', ['بند', 'Item'], ['أبرز المعلومات', 'Key facts'], [
              {
                type: 'row',
                fields: [
                  text('label', 'العنوان', 'Label', { required: true, admin: { width: '50%' } }),
                  text('value', 'القيمة', 'Value', { required: true, admin: { width: '50%' } }),
                ],
              },
            ]),
            items('gallery', ['صورة', 'Image'], ['معرض الصور', 'Gallery'], [
              image('image', 'الصورة', 'Image', { required: true }),
            ]),
          ],
        },
        {
          label: L('المكان والزمان', 'Where & when'),
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  label: L('تاريخ البداية', 'Start date'),
                  required: true,
                  admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' } },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  label: L('تاريخ النهاية (اختياري)', 'End date (optional)'),
                  admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' } },
                },
              ],
            },
            relation('division', 'القسم', 'Division', 'divisions'),
            relation('branch', 'الفرع', 'Branch', 'branches'),
            text('location', 'المكان (إن لم يكن أحد الفروع)', 'Location (if not one of the branches)'),
            plain('registrationUrl', 'رابط التسجيل', 'Registration link'),
          ],
        },
      ],
    },
    select(
      'kind',
      'النوع',
      'Type',
      [
        { value: 'tournament', ar: 'بطولة', en: 'Tournament' },
        { value: 'course', ar: 'دورة تدريبية', en: 'Training course' },
      ],
      { required: true, defaultValue: 'tournament', admin: { position: 'sidebar' } },
    ),
    slug(),
    checkbox('featured', 'مميّز', 'Featured', { admin: { position: 'sidebar' } }),
  ],
  hooks: revalidateCollection('tournaments'),
}
