import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { checkbox, image, items, number, order, plain, relation, select, text, textarea } from '../fields'
import { slug } from '../fields/slug'
import { revalidateCollection } from '../hooks/revalidate'
import { L } from '../labels'
import { collectionPreview } from '../preview'

export const Divisions: CollectionConfig = {
  slug: 'divisions',
  labels: { singular: L('قسم', 'Division'), plural: L('الأقسام', 'Divisions') },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'order', '_status', 'updatedAt'],
    group: L('المحتوى', 'Content'),
    livePreview: collectionPreview('/divisions'),
    description: L(
      'ملاعب البادل، الصالة الرياضية، المسبح، التنس، كرة القدم، كرة السلة… كل قسم له صفحة خاصة.',
      'Padel, gym, pool, tennis, football, basketball… each division gets its own page.',
    ),
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: 'order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('المحتوى', 'Content'),
          fields: [
            text('title', 'اسم القسم', 'Title', { required: true }),
            text('kicker', 'سطر تعريفي قصير', 'Kicker'),
            textarea('summary', 'نبذة مختصرة', 'Summary', {
              required: true,
              admin: { description: L('تظهر في بطاقة القسم وفي صفحة الأقسام', 'Shown on the division card and listing') },
            }),
            textarea('lede', 'السطر الافتتاحي في صفحة القسم', 'Opening line on the division page'),
            image('image', 'الصورة الرئيسية', 'Main image', { required: true }),
            items('story', ['فقرة', 'Paragraph'], ['فقرات التعريف', 'Story paragraphs'], [
              textarea('text', 'النص', 'Text', { required: true }),
            ]),
            items('features', ['ميزة', 'Feature'], ['المزايا', 'Features'], [
              text('title', 'العنوان', 'Title', { required: true }),
              textarea('body', 'الوصف', 'Description'),
            ]),
            items('highlights', ['وسم', 'Tag'], ['وسوم سريعة', 'Quick tags'], [
              text('label', 'النص', 'Label', { required: true }),
            ]),
            {
              name: 'figure',
              type: 'group',
              label: L('رقم بارز (اختياري)', 'Headline figure (optional)'),
              fields: [
                number('value', 'القيمة', 'Value'),
                plain('suffix', 'لاحقة', 'Suffix', { admin: { description: L('مثل +', 'e.g. +'), width: '30%' } }),
                text('label', 'الوصف', 'Label'),
              ],
            },
          ],
        },
        {
          label: L('الربط', 'Relations'),
          fields: [
            relation('branches', 'الفروع المتوفر فيها', 'Available at branches', 'branches', { hasMany: true }),
            relation('coaches', 'المدربون', 'Coaches', 'coaches', { hasMany: true }),
          ],
        },
      ],
    },
    slug(),
    select(
      'icon',
      'الأيقونة',
      'Icon',
      [
        { value: 'padel', ar: 'بادل', en: 'Padel' },
        { value: 'gym', ar: 'صالة رياضية', en: 'Gym' },
        { value: 'swimming', ar: 'سباحة', en: 'Swimming' },
        { value: 'tennis', ar: 'تنس', en: 'Tennis' },
        { value: 'football', ar: 'كرة قدم', en: 'Football' },
        { value: 'basketball', ar: 'كرة سلة', en: 'Basketball' },
        { value: 'mark', ar: 'شعار المجموعة', en: 'Group mark' },
      ],
      { defaultValue: 'mark', admin: { position: 'sidebar' } },
    ),
    order(),
    checkbox('bookable', 'يمكن الحجز فيه', 'Bookable', {
      defaultValue: true,
      admin: { position: 'sidebar', description: L('يظهر في قائمة النشاط بنموذج الحجز', 'Listed in the booking form') },
    }),
  ],
  hooks: revalidateCollection('divisions'),
}
