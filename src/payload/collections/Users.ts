import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'
import { L } from '../labels'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: L('مستخدم', 'User'), plural: L('المستخدمون', 'Users') },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'updatedAt'],
    group: L('النظام', 'System'),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text', label: L('الاسم', 'Name'), required: true }],
}
