import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload, type PayloadRequest } from 'payload'
import config from '@payload-config'

/**
 * Entry point for the admin's preview / live-preview iframe.
 * Only a logged-in CMS user with the preview secret can switch on draft mode.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const secret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid preview secret', { status: 403 })
  }
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return new Response('A relative path is required', { status: 400 })
  }

  const payload = await getPayload({ config })
  let user
  try {
    ;({ user } = await payload.auth({ req: req as unknown as PayloadRequest, headers: req.headers }))
  } catch (error) {
    payload.logger.error({ err: error }, 'preview: auth failed')
  }

  const draft = await draftMode()
  if (!user) {
    draft.disable()
    return new Response('You must be logged in to the admin to preview', { status: 403 })
  }

  draft.enable()
  redirect(path)
}
