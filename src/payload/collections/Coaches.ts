import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../access'
import { image, order, relation, text, textarea } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'
import { L } from '../labels'

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  labels: { singular: L('مدرب', 'Coach'), plural: L('الكادر التدريبي', 'Coaching staff') },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'division', 'order', '_status'],
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
    text('name', 'الاسم', 'Name', { required: true }),
    text('role', 'الصفة / التخصص', 'Role', { required: true }),
    image('photo', 'الصورة', 'Photo', { required: true }),
    textarea('bio', 'نبذة', 'Bio'),
    relation('division', 'القسم', 'Division', 'divisions', { admin: { position: 'sidebar' } }),
    relation('branch', 'الفرع', 'Branch', 'branches', { admin: { position: 'sidebar' } }),
    order(),
  ],
  hooks: revalidateCollection('coaches'),
}
