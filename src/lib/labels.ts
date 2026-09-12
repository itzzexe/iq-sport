import type { Setting } from '@/payload-types'
import { UI_STRINGS, type UIKey } from './ui-strings'
import type { Locale } from './i18n'

export type T = (key: UIKey) => string

/**
 * Resolves a UI string: the editor's override from Site settings → Labels,
 * else the built-in default for the locale.
 */
export function makeT(settings: Pick<Setting, 'labels'> | null | undefined, locale: Locale): T {
  const overrides = (settings?.labels ?? {}) as Partial<Record<UIKey, string | null>>
  return (key) => {
    const custom = overrides[key]
    return custom && custom.trim() ? custom : UI_STRINGS[key][locale]
  }
}
