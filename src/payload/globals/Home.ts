import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { checkbox, image, items, select, text, textarea } from '../fields'
import { revalidateGlobal } from '../hooks/revalidate'
import { L } from '../labels'
import { globalPreview } from '../preview'
import { PAGE_OPTIONS } from './Settings'

const TILE_PAGES = PAGE_OPTIONS.filter((p) => !['home', 'contact'].includes(p.value))

const cta = (name: string, ar: string, en: string) => ({
  name,
  type: 'group' as const,
  label: L(ar, en),
  fields: [
    {
      type: 'row' as const,
      fields: [
        text('label', 'نص الزر', 'Button label', { admin: { width: '50%' } }),
        select('target', 'الوجهة', 'Target', PAGE_OPTIONS, { admin: { width: '50%' } }),
      ],
    },
  ],
})

export const Home: GlobalConfig = {
  slug: 'home',
  label: L('الصفحة الرئيسية', 'Home page'),
  admin: { group: L('الصفحات', 'Pages'), livePreview: globalPreview('/') },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('الواجهة (Hero)', 'Hero'),
          name: 'hero',
          fields: [
            text('title', 'العنوان الرئيسي', 'Headline', { required: true }),
            textarea('subtitle', 'النص تحت العنوان', 'Subtitle'),
            image('background', 'صورة الخلفية', 'Background image', {
              admin: { description: L('صورة عريضة عالية الدقة (1920 بكسل أو أكثر)', 'Wide, high-resolution image (1920 px or more)') },
            }),
            cta('primaryCta', 'الزر الرئيسي', 'Primary button'),
            cta('secondaryCta', 'الزر الثانوي', 'Secondary button'),
          ],
        },
        {
          label: L('النبذة التعريفية', 'About'),
          name: 'about',
          fields: [
            text('eyebrow', 'العنوان الصغير', 'Eyebrow'),
            text('title', 'العنوان', 'Title', { required: true }),
            items('paragraphs', ['فقرة', 'Paragraph'], ['الفقرات', 'Paragraphs'], [
              textarea('text', 'النص', 'Text', { required: true }),
            ]),
            image('image', 'الصورة', 'Image'),
            items('pillars', ['ركيزة', 'Pillar'], ['الركائز', 'Pillars'], [text('label', 'النص', 'Label', { required: true })]),
          ],
        },
        {
          label: L('شبكة الأقسام', 'Sections grid'),
          name: 'sections',
          fields: [
            text('eyebrow', 'العنوان الصغير', 'Eyebrow'),
            text('title', 'العنوان', 'Title'),
            textarea('intro', 'المقدّمة', 'Intro'),
            items('tiles', ['مربع', 'Tile'], ['المربعات', 'Tiles'], [
              {
                type: 'row',
                fields: [
                  select('page', 'الصفحة', 'Page', TILE_PAGES, { required: true, admin: { width: '40%' } }),
                  text('title', 'العنوان', 'Title', { required: true, admin: { width: '60%' } }),
                ],
              },
              text('blurb', 'سطر وصفي', 'One-line description'),
              image('image', 'صورة الخلفية', 'Background image'),
              checkbox('enabled', 'ظاهر', 'Visible', { defaultValue: true }),
            ]),
          ],
        },
        {
          label: L('تواصل معنا والحجز', 'Contact & booking'),
          name: 'contact',
          fields: [
            text('eyebrow', 'العنوان الصغير', 'Eyebrow'),
            text('title', 'العنوان', 'Title', { required: true }),
            textarea('body', 'النص', 'Body'),
            textarea('formIntro', 'مقدمة النموذج', 'Form intro'),
            textarea('successMessage', 'رسالة النجاح بعد الإرسال', 'Success message'),
            textarea('note', 'ملاحظة جانبية', 'Side note'),
          ],
        },
      ],
    },
  ],
  hooks: revalidateGlobal('global_home'),
}
