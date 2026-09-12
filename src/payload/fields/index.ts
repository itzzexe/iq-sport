import type {
  ArrayField,
  CheckboxField,
  Field,
  NumberField,
  RelationshipField,
  SelectField,
  TextareaField,
  TextField,
  UploadField,
  PayloadRequest,
} from 'payload'
import { L } from '../labels'

type Extra<T> = Partial<Omit<T, 'name' | 'type' | 'label'>>

/**
 * `required` for the default locale only. A translation left blank falls back
 * to the Arabic value on the site, so it must not block saving the English
 * version — otherwise every row of every list would have to be translated
 * before an editor could publish a single English title.
 */
const requiredInDefaultLocale = (value: null | string | undefined, { req }: { req: PayloadRequest }): string | true => {
  const defaultLocale = req.payload.config.localization ? req.payload.config.localization.defaultLocale : undefined
  const isDefault = !req.locale || req.locale === defaultLocale
  if (isDefault && (typeof value !== 'string' || value.trim().length === 0)) return req.t('validation:required')
  return true
}

const localised = <T extends TextField | TextareaField>(extra: Extra<T>): Extra<T> =>
  extra.required && !extra.validate ? { ...extra, validate: requiredInDefaultLocale as unknown as T['validate'] } : extra

/** Localised single-line text (Arabic + English). */
export const text = (name: string, ar: string, en: string, extra: Extra<TextField> = {}): TextField =>
  ({ name, type: 'text', localized: true, label: L(ar, en), ...localised(extra) }) as TextField

/** Non-localised text (phone numbers, URLs, identifiers). */
export const plain = (name: string, ar: string, en: string, extra: Extra<TextField> = {}): TextField =>
  ({ name, type: 'text', label: L(ar, en), ...extra }) as TextField

/** Localised multi-line text. */
export const textarea = (
  name: string,
  ar: string,
  en: string,
  extra: Extra<TextareaField> = {},
): TextareaField => ({ name, type: 'textarea', localized: true, label: L(ar, en), ...localised(extra) }) as TextareaField

export const number = (name: string, ar: string, en: string, extra: Extra<NumberField> = {}): NumberField =>
  ({ name, type: 'number', label: L(ar, en), ...extra }) as NumberField

export const checkbox = (
  name: string,
  ar: string,
  en: string,
  extra: Extra<CheckboxField> = {},
): CheckboxField => ({ name, type: 'checkbox', label: L(ar, en), ...extra }) as CheckboxField

export const image = (name: string, ar: string, en: string, extra: Extra<UploadField> = {}): UploadField =>
  ({ name, type: 'upload', relationTo: 'media', label: L(ar, en), ...extra }) as UploadField

export const select = (
  name: string,
  ar: string,
  en: string,
  options: { value: string; ar: string; en: string }[],
  extra: Extra<SelectField> = {},
): SelectField =>
  ({
    name,
    type: 'select',
    label: L(ar, en),
    options: options.map((o) => ({ value: o.value, label: L(o.ar, o.en) })),
    ...extra,
  }) as SelectField

export const relation = (
  name: string,
  ar: string,
  en: string,
  relationTo: RelationshipField['relationTo'],
  extra: Extra<RelationshipField> = {},
): RelationshipField => ({ name, type: 'relationship', relationTo, label: L(ar, en), ...extra }) as RelationshipField

/** Repeatable rows; the admin shows the first text field of each row as its label. */
export const items = (
  name: string,
  singular: [string, string],
  plural: [string, string],
  fields: Field[],
  extra: Extra<ArrayField> = {},
): ArrayField =>
  ({
    name,
    type: 'array',
    label: L(plural[0], plural[1]),
    labels: { singular: L(singular[0], singular[1]), plural: L(plural[0], plural[1]) },
    fields,
    admin: {
      initCollapsed: true,
      components: { RowLabel: '@/payload/components/RowLabel#RowLabel' },
      ...(extra.admin ?? {}),
    },
    ...extra,
  }) as ArrayField

/** Manual ordering for lists — lower numbers first. */
export const order = (): NumberField =>
  number('order', 'الترتيب', 'Order', {
    defaultValue: 0,
    admin: { position: 'sidebar', description: L('الأصغر يظهر أولاً', 'Lower numbers appear first') },
  })

/** "Page heading" block shared by every inner page global. */
export const pageHeading = (): Field[] => [
  text('eyebrow', 'العنوان الصغير', 'Eyebrow'),
  text('title', 'العنوان', 'Title', { required: true }),
  textarea('intro', 'المقدّمة', 'Intro'),
]
