import { NextResponse, type NextRequest } from 'next/server'

/**
 * URL ↔ locale mapping.
 *
 *   /            → renders app/(frontend)/[lang]  with lang = ar   (rewrite, URL unchanged)
 *   /branches    → /ar/branches                                     (rewrite)
 *   /en/branches → served as-is                                      (lang = en)
 *   /ar/branches → 308 redirect to /branches                        (one canonical URL per page)
 *
 * The admin, the API, Next internals and static files are never touched.
 * The resolved locale is forwarded as an `x-locale` request header so the
 * not-found boundary (which gets no route params) can localise itself.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static files and metadata routes (favicon.svg, sitemap.xml, robots.txt, images…)
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next()

  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  const headers = new Headers(request.headers)

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    headers.set('x-locale', 'en')
    return NextResponse.next({ request: { headers } })
  }

  headers.set('x-locale', 'ar')
  const url = request.nextUrl.clone()
  url.pathname = `/ar${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = {
  // Everything except the admin, the REST API, the preview routes, build assets and
  // static files. (Files with an extension are also skipped inside `proxy` itself.)
  matcher: ['/((?!admin|api|next|_next).*)'],
}
