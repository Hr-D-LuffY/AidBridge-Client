import { type NextRequest, NextResponse } from 'next/server'
import { decodeJwtPayload, isTokenExpired } from '@/lib/auth/jwt'
import { requiredRole } from '@/lib/auth/routes'
import { GUEST_ONLY_PATHS, ROLE_HOME_PATH, TOKEN_COOKIE } from '@/lib/constants'

// Route guard (Next 16 name for middleware). It only answers "is there a live session?":
//
//   no session on a protected page    -> /login?redirect=<path>
//   logged in on /login or /register -> their own area
//
// It deliberately does NOT compare the role with the area. The role inside the token can be stale:
// an approved volunteer request changes the role in the database without issuing a new token, so a
// new volunteer still holds a "victim" token. Redirecting on that would bounce them between /dashboard
// and /volunteer forever. The area layouts check the live role with GET /auth/me and send a wrong
// role to its own area; the backend re-checks the role on every request.

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url))
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const payload = token ? decodeJwtPayload(token) : null
  const session = payload && !isTokenExpired(payload) ? payload : null

  if (GUEST_ONLY_PATHS.includes(pathname)) {
    return session ? redirectTo(request, ROLE_HOME_PATH[session.role]) : NextResponse.next()
  }

  if (requiredRole(pathname) && !session) {
    return redirectTo(request, `/login?redirect=${encodeURIComponent(`${pathname}${search}`)}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/volunteer/:path*',
    '/ngo/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
}
