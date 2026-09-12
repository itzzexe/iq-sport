import type { CollectionConfig } from 'payload'
import { authenticated, nobody } from '../access'
import { plain, relation, select } from '../fields'
import { L } from '../labels'

/**
 * Booking requests submitted from the website's contact form.
 * Created only by the server action (never through the public API), read and
 * managed by admins from the dashboard.
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: L('طلب حجز', 'Booking request'), plural: L('طلبات الحجز', 'Booking requests') },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'branch', 'division', 'date', 'status', 'createdAt'],
    group: L('الطلبات', 'Requests'),
    description: L(
      'كل طلب يصل من نموذج «تواصل معنا» يظهر هنا. حدّث الحالة بعد التواصل مع العميل.',
      'Every request sent from the contact form lands here. Update the status after contacting the customer.',
    ),
  },
  access: {
    create: nobody,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        plain('name', 'الاسم', 'Name', { required: true, admin: { width: '50%' } }),
        plain('phone', 'رقم الهاتف', 'Phone', { required: true, admin: { width: '50%' } }),
      ],
    },
    {
      type: 'row',
      fields: [
        relation('branch', 'الفرع', 'Branch', 'branches', { admin: { width: '50%' } }),
        relation('division', 'النشاط', 'Activity', 'divisions', { admin: { width: '50%' } }),
      ],
    },
    {
      name: 'date',
      type: 'date',
      label: L('التاريخ المفضّل', 'Preferred date'),
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' } },
    },
    { name: 'notes', type: 'textarea', label: L('ملاحظات العميل', 'Customer notes') },
    select(
      'status',
      'الحالة',
      'Status',
      [
        { value: 'new', ar: 'جديد', en: 'New' },
        { value: 'contacted', ar: 'تم التواصل', en: 'Contacted' },
        { value: 'confirmed', ar: 'مؤكّد', en: 'Confirmed' },
        { value: 'cancelled', ar: 'ملغى', en: 'Cancelled' },
      ],
      { required: true, defaultValue: 'new', admin: { position: 'sidebar' } },
    ),
    select(
      'locale',
      'لغة الزائر',
      'Visitor language',
      [
        { value: 'ar', ar: 'العربية', en: 'Arabic' },
        { value: 'en', ar: 'الإنجليزية', en: 'English' },
      ],
      { admin: { position: 'sidebar', readOnly: true } },
    ),
    plain('source', 'المصدر', 'Source', { defaultValue: 'website', admin: { position: 'sidebar', readOnly: true } }),
  ],
}
