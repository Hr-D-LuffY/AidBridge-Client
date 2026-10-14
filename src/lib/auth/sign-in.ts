import 'server-only'
import type { LoginPayload, RegisterPayload } from '@/features/auth/auth.schema'
import { ApiError } from '@/lib/api/errors'
import { serverApi } from '@/lib/api/server'
import type { AuthResult, SessionUser } from '@/types/user'
import { startSession } from './session'

// Shared by every route that starts a session (password login, sign-up, demo login):
// backend call -> the two cookies. Returns the small session the UI keeps.

// Forward the browser's IP so the backend's per-IP rate limit does not see one shared server.
function forwardedHeaders(clientIp: string | null): Record<string, string> {
  return clientIp ? { 'x-forwarded-for': clientIp } : {}
}

async function openSession({ token, user }: AuthResult): Promise<SessionUser> {
  const session: SessionUser = { id: user.id, name: user.name, role: user.role }
  // A token we cannot read would leave a half-signed-in browser, so fail loudly instead.
  if (!(await startSession(token, session))) {
    throw new ApiError({ status: 502, message: 'The server sent an unreadable login. Try again.' })
  }
  return session
}

export async function signIn(
  credentials: LoginPayload,
  clientIp: string | null,
): Promise<SessionUser> {
  const { data } = await serverApi.request<AuthResult>('/auth/login', {
    method: 'POST',
    body: credentials,
    headers: forwardedHeaders(clientIp),
  })
  return openSession(data)
}

// Sign-up creates a victim account and returns a token, so the user is signed in straight away.
export async function signUp(
  payload: RegisterPayload,
  clientIp: string | null,
): Promise<SessionUser> {
  const { data } = await serverApi.request<AuthResult>('/auth/register', {
    method: 'POST',
    body: payload,
    headers: forwardedHeaders(clientIp),
  })
  return openSession(data)
}
