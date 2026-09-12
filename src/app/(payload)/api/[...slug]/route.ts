/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

/** Image sizes for a large upload can take longer than the 10 s serverless default. */
export const maxDuration = 60

const get = REST_GET(config)

/**
 * Uploaded files are content-addressed (a replaced file gets a new name and the
 * site cache-busts with `?v=`), so successful media responses can be cached for
 * a year. The header is added here rather than in `next.config.ts` so that a
 * 404/500 is never cached alongside them.
 */
export const GET: typeof get = async (request, args) => {
  const res = await get(request, args)
  if (res.ok && new URL(request.url).pathname.startsWith('/api/media/file/')) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  return res
}
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
