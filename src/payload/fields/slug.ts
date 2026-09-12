import type { TextField } from 'payload'
import { L } from '../labels'

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * URL identifier. Deliberately a plain (non-localised) field the editor types
 * in Latin letters: Arabic slugs would URL-encode into unreadable links and
 * duplicate every page per language.
 */
export const slug = (): TextField => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  label: L('المعرّف في الرابط (slug)', 'URL slug'),
  admin: {
    position: 'sidebar',
    description: L(
      'أحرف إنجليزية صغيرة وأرقام وشرطات فقط — مثال: padel. يظهر في رابط الصفحة ولا يُنصح بتغييره بعد النشر.',
      'Lowercase letters, digits and hyphens only — e.g. padel. Appears in the page URL; avoid changing it once published.',
    ),
  },
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        // Left blank: derive it from the title when the title is Latin (an Arabic title slugifies to nothing).
        const title = (siblingData as { title?: unknown } | undefined)?.title
        const derived = typeof title === 'string' ? slugify(title) : ''
        return derived || value
      },
    ],
  },
  // A custom `validate` replaces Payload's default text validator, so the `required` check lives here too.
  validate: (value, { required, req }) => {
    if (typeof value !== 'string' || value.length === 0) return required ? req.t('validation:required') : true
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase letters, digits and hyphens only'
  },
})
