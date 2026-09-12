import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { image, items, number, order, plain, text, textarea } from '../fields'
import { slug } from '../fields/slug'
import { revalidateCollection } from '../hooks/revalidate'
import { L } from '../labels'

export const Branches: CollectionConfig = {
  slug: 'branches',
  labels: { singular: L('فرع', 'Branch'), plural: L('الفروع', 'Branches') },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'area', 'phone', 'order', '_status'],
    group: L('المحتوى', 'Content'),
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
    text('title', 'اسم الفرع', 'Branch name', { required: true }),
    text('area', 'المنطقة', 'Area'),
    textarea('address', 'العنوان التفصيلي', 'Street address'),
    image('image', 'صورة الفرع', 'Photo'),
    items('facilities', ['مرفق', 'Facility'], ['المرافق', 'Facilities'], [
      text('label', 'المرفق', 'Facility', { required: true }),
    ]),
    text('hours', 'ساعات العمل', 'Opening hours'),
    {
      type: 'row',
      fields: [
        plain('phone', 'الهاتف', 'Phone', { admin: { width: '50%' } }),
        plain('whatsapp', 'واتساب (أرقام فقط مع رمز الدولة)', 'WhatsApp (digits only, with country code)', {
          admin: { width: '50%', placeholder: '9647700000000' },
        }),
      ],
    },
    plain('mapsUrl', 'رابط خرائط Google', 'Google Maps link'),
    {
      name: 'geo',
      type: 'group',
      label: L('الإحداثيات الجغرافية (لنتائج البحث)', 'Geo coordinates (for search results)'),
      fields: [
        {
          type: 'row',
          fields: [
            number('lat', 'خط العرض', 'Latitude', { admin: { width: '50%', step: 0.000001 } }),
            number('lng', 'خط الطول', 'Longitude', { admin: { width: '50%', step: 0.000001 } }),
          ],
        },
      ],
    },
    {
      name: 'mapPosition',
      type: 'group',
      label: L('موقع النقطة على خريطة بغداد', 'Pin position on the Baghdad map artwork'),
      admin: {
        description: L(
          'نسبة مئوية من يسار الخريطة وأعلاها. 50 / 50 هو المنتصف.',
          'Percent from the left and top of the map image. 50 / 50 is the centre.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            number('x', 'أفقياً %', 'Horizontal %', { min: 0, max: 100, defaultValue: 50, admin: { width: '50%' } }),
            number('y', 'عمودياً %', 'Vertical %', { min: 0, max: 100, defaultValue: 50, admin: { width: '50%' } }),
          ],
        },
      ],
    },
    slug(),
    order(),
  ],
  hooks: revalidateCollection('branches'),
}
