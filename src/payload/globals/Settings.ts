import type { Field, GlobalConfig } from 'payload'
import { UI_KEYS, UI_STRINGS } from '@/lib/ui-strings'
import { anyone, authenticated } from '../access'
import { checkbox, image, items, plain, select, text, textarea } from '../fields'
import { revalidateGlobal } from '../hooks/revalidate'
import { L } from '../labels'

export const PAGE_OPTIONS = [
  { value: 'home', ar: 'الرئيسية', en: 'Home' },
  { value: 'divisions', ar: 'الأقسام', en: 'Divisions' },
  { value: 'branches', ar: 'الفروع', en: 'Branches' },
  { value: 'statistics', ar: 'الإحصائيات', en: 'Statistics' },
  { value: 'team', ar: 'الكادر التدريبي', en: 'Coaching staff' },
  { value: 'tournaments', ar: 'البطولات والدورات', en: 'Tournaments & courses' },
  { value: 'vision', ar: 'الرؤية', en: 'Vision' },
  { value: 'contact', ar: 'تواصل معنا', en: 'Contact' },
]

/** One editable text per UI string, generated from the shared dictionary. */
const labelFields: Field[] = UI_KEYS.map((key) => {
  const { ar, en } = UI_STRINGS[key]
  return text(key, ar, en, {
    admin: { placeholder: ar, description: L(`الافتراضي: ${ar}`, `Default: ${en}`) },
  })
})

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: L('إعدادات الموقع', 'Site settings'),
  admin: { group: L('الإعدادات', 'Settings') },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L('الهوية', 'Identity'),
          fields: [
            text('siteName', 'اسم الموقع', 'Site name', { required: true }),
            text('shortName', 'الاسم المختصر', 'Short name'),
            text('tagline', 'الشعار النصي', 'Tagline'),
            image('logo', 'شعار بديل (اختياري)', 'Alternative logo (optional)', {
              admin: {
                description: L(
                  'اتركه فارغاً لاستخدام شعار الهوية المدمج في الموقع.',
                  'Leave empty to use the built-in brand lockup.',
                ),
              },
            }),
          ],
        },
        {
          label: L('التواصل', 'Contact'),
          fields: [
            {
              type: 'row',
              fields: [
                plain('phone', 'الهاتف الرئيسي', 'Main phone', { admin: { width: '50%' } }),
                plain('whatsapp', 'واتساب (أرقام فقط مع رمز الدولة)', 'WhatsApp (digits only, with country code)', {
                  admin: { width: '50%', placeholder: '9647700000000' },
                }),
              ],
            },
            plain('email', 'البريد الإلكتروني', 'Email'),
            textarea('address', 'العنوان', 'Address'),
            {
              type: 'row',
              fields: [
                text('city', 'المدينة', 'City', { admin: { width: '50%' } }),
                text('country', 'الدولة', 'Country', { admin: { width: '50%' } }),
              ],
            },
            plain('mapsUrl', 'رابط خرائط Google', 'Google Maps link'),
            text('hours', 'ساعات العمل', 'Opening hours'),
            items('socials', ['حساب', 'Account'], ['حسابات التواصل الاجتماعي', 'Social accounts'], [
              {
                type: 'row',
                fields: [
                  select(
                    'platform',
                    'المنصة',
                    'Platform',
                    [
                      { value: 'instagram', ar: 'إنستغرام', en: 'Instagram' },
                      { value: 'facebook', ar: 'فيسبوك', en: 'Facebook' },
                      { value: 'tiktok', ar: 'تيك توك', en: 'TikTok' },
                      { value: 'youtube', ar: 'يوتيوب', en: 'YouTube' },
                      { value: 'x', ar: 'إكس (تويتر)', en: 'X (Twitter)' },
                      { value: 'snapchat', ar: 'سناب شات', en: 'Snapchat' },
                      { value: 'whatsapp', ar: 'واتساب', en: 'WhatsApp' },
                      { value: 'other', ar: 'أخرى', en: 'Other' },
                    ],
                    { required: true, admin: { width: '40%' } },
                  ),
                  plain('url', 'الرابط', 'URL', { required: true, admin: { width: '60%' } }),
                ],
              },
            ]),
          ],
        },
        {
          label: L('التنقل', 'Navigation'),
          fields: [
            items('nav', ['رابط', 'Link'], ['روابط القائمة الرئيسية', 'Main menu links'], [
              {
                type: 'row',
                fields: [
                  select('page', 'الصفحة', 'Page', PAGE_OPTIONS, { required: true, admin: { width: '40%' } }),
                  text('label', 'النص', 'Label', { required: true, admin: { width: '60%' } }),
                ],
              },
            ]),
            textarea('footerText', 'نص التذييل', 'Footer text'),
            text('copyright', 'سطر الحقوق', 'Copyright line', {
              admin: { description: L('السنة تُضاف تلقائياً', 'The year is added automatically') },
            }),
          ],
        },
        {
          label: L('محركات البحث (SEO)', 'Search engines (SEO)'),
          fields: [
            plain('siteUrl', 'رابط الموقع الكامل', 'Canonical site URL', {
              admin: {
                placeholder: 'https://iqsportsgroup.iq',
                description: L(
                  'بدون شرطة مائلة في النهاية. يُستخدم في canonical و sitemap و OpenGraph.',
                  'No trailing slash. Used for canonical URLs, the sitemap and OpenGraph.',
                ),
              },
            }),
            text('defaultTitle', 'العنوان الافتراضي', 'Default title', {
              admin: { description: L('يظهر في تبويب المتصفح ونتائج البحث', 'Browser tab and search result title') },
            }),
            textarea('defaultDescription', 'الوصف الافتراضي', 'Default description', {
              admin: { description: L('يُفضّل ألا يتجاوز ١٦٠ حرفاً', 'Ideally 160 characters or fewer') },
            }),
            items('keywords', ['كلمة', 'Keyword'], ['الكلمات المفتاحية', 'Keywords'], [
              text('keyword', 'الكلمة المفتاحية', 'Keyword', { required: true }),
            ]),
            image('ogImage', 'صورة المشاركة الافتراضية', 'Default share image', {
              admin: { description: L('1200 × 630 بكسل', '1200 × 630 px') },
            }),
            checkbox('allowIndexing', 'السماح لمحركات البحث بفهرسة الموقع', 'Allow search engines to index the site', {
              defaultValue: true,
            }),
            plain('googleSiteVerification', 'رمز التحقق من Google Search Console', 'Google Search Console verification code'),
          ],
        },
        {
          label: L('النصوص', 'Labels'),
          description: L(
            'نصوص الأزرار والعناوين الصغيرة في الموقع. اترك الحقل فارغاً لاستخدام النص الافتراضي.',
            'Button and micro-copy strings used across the site. Leave a field empty to use the default.',
          ),
          fields: [{ name: 'labels', type: 'group', label: false, fields: labelFields }],
        },
      ],
    },
    { name: 'seededAt', type: 'date', admin: { hidden: true } },
  ],
  hooks: revalidateGlobal('global_settings'),
}
