import 'server-only'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { SESSION_COOKIE, TOKEN_COOKIE } from '@/lib/constants'
import { Role } from '@/types/enums'
import type { SessionUser } from '@/types/user'
import { decodeJwtPayload, secondsUntilExpiry } from './jwt'

// Cookie helpers for the BFF session. Both cookies are httpOnly on the frontend domain.
//
//   ab_token    the backend's access token (the only credential; there is no refresh token)
//   ab_session  { id, name, role }, a small copy so the first paint and the route guard need no request
//
// Both cookies expire when the token does, so a dead session is simply a missing cookie.

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const

const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(Role),
})

// Stores a freshly issued token (login, register, change-password) and the user it belongs to.
// Returns false when the token cannot be read, so the caller can answer with an error instead of
// leaving a half-signed-in browser.
export async function startSession(token: string, user: SessionUser): Promise<boolean> {
  const payload = decodeJwtPayload(token)
  if (!payload) return false

  const maxAge = secondsUntilExpiry(payload)
  const store = await cookies()
  store.set(TOKEN_COOKIE, token, { ...baseCookieOptions, maxAge })
  store.set(SESSION_COOKIE, JSON.stringify(user), { ...baseCookieOptions, maxAge })
  return true
}

export async function clearSession() {
  const store = await cookies()
  for (const name of [TOKEN_COOKIE, SESSION_COOKIE]) {
    store.set(name, '', { ...baseCookieOptions, maxAge: 0 })
  }
}

export async function getAccessToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value
}

// The signed-in user's cached copy for Server Components, or null (also for a corrupt cookie).
// Only for the first paint: area layouts confirm the live role with GET /auth/me.
export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = sessionUserSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
