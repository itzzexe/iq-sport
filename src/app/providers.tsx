'use client'

import { LangProvider } from '@/lib/lang'
import { ScrollProvider } from '@/lib/scroll'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <ScrollProvider>{children}</ScrollProvider>
    </LangProvider>
  )
}
