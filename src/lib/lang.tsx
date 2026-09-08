'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Bi, Lang } from '@/data/site'
import { phase } from '@/webgl/store'

type Ctx = {
  lang: Lang
  dir: 'rtl' | 'ltr'
  t: (value: Bi) => string
  setLang: (lang: Lang) => void
  toggle: () => void
}

const LangContext = createContext<Ctx | null>(null)
const STORAGE_KEY = 'iqsg:lang'

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'ar' || stored === 'en') setLangState(stored)
    } catch {
      /* private mode / blocked storage — the Arabic default is correct anyway */
    }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* non-fatal */
    }
  }, [])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // The document element carries lang/dir so CSS logical properties and the
  // font stacks resolve correctly for the whole page, not just this subtree.
  // The WebGL scene sits outside React's tree, so it is told separately.
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    phase.rtl = dir === 'rtl'
  }, [lang, dir])

  const value: Ctx = {
    lang,
    dir,
    t: (v) => v[lang],
    setLang,
    toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
