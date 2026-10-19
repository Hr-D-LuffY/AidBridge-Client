import type { NextRequest } from 'next/server'
import { API_TIMEOUT_MS } from '@/lib/api/core'
import { NETWORK_ERROR_MESSAGE } from '@/lib/api/errors'
import { clearSession, getAccessToken } from '@/lib/auth/session'
import { env } from '@/lib/env'

// A hosted free-tier backend can take about a minute to wake up, so the host must not cut this off first.
export const maxDuration = 60

// BFF proxy: the browser calls /api/backend/<path>, this forwards to the backend with the Bearer
// token from the httpOnly cookie. There is no refresh flow (the backend issues one access token), so
// a 401 from the backend ends the session here: the cookies are cleared and the 401 goes through,
// and the browser client sends the user to /login.

type RouteContext = { params: Promise<{ path: string[] }> }

// Request headers worth forwarding. Cookies and Host are deliberately left out.
const FORWARDED_HEADERS = ['content-type', 'accept', 'accept-language']

// fetch needs `duplex: 'half'` to send a streamed body; the DOM types do not know the option yet.
type StreamingInit = RequestInit & { duplex: 'half' }

function buildTargetUrl(path: string[], search: string) {
  return `${env.BACKEND_API_URL}/${path.map(encodeURIComponent).join('/')}${search}`
}

function buildHeaders(request: NextRequest, accessToken: string | undefined) {
  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  // The browser's real IP, so the backend's per-IP rate limit does not see one shared server.
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor)
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
  return headers
}

// Pass the backend's answer through untouched (status, JSON, content type). Its Set-Cookie and
// encoding headers are dropped on purpose.
function passThrough(upstream: Response) {
  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  // The backend's clock, so a countdown can be corrected for a wrong clock on the device.
  const date = upstream.headers.get('date')
  if (date) headers.set('date', date)
  return new Response(upstream.body, { status: upstream.status, headers })
}

function gatewayError() {
  return Response.json(
    { success: false, message: NETWORK_ERROR_MESSAGE, errors: [] },
    { status: 502 },
  )
}

async function handler(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  const url = buildTargetUrl(path, request.nextUrl.search)
  const accessToken = await getAccessToken()
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  try {
    // The body is streamed, not buffered: SOS media can be several files of up to 10 MB each.
    const init: StreamingInit = {
      method: request.method,
      headers: buildHeaders(request, accessToken),
      body: hasBody ? request.body : undefined,
      duplex: 'half',
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      cache: 'no-store',
    }
    const upstream = await fetch(url, init)

    // Only a request that carried a token can mean "your session ended" (a wrong password on a
    // public route is also 401, but those go through /api/auth/*, not here).
    if (upstream.status === 401 && accessToken) await clearSession()
    return passThrough(upstream)
  } catch {
    return gatewayError()
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
