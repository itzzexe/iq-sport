'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** Inside the admin's live-preview iframe: re-render the page whenever the editor saves. */
export function LivePreviewListener() {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={router.refresh} serverURL={typeof window !== 'undefined' ? window.location.origin : ''} />
}
