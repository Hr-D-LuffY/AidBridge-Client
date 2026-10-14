import { NextResponse } from 'next/server'
import { jsonSuccess } from '@/lib/api/respond'
import { clearSession } from '@/lib/auth/session'

// The backend has no logout endpoint: a token simply expires. Signing out here means forgetting it.

// POST /api/auth/logout
export async function POST() {
  await clearSession()
  return jsonSuccess('Logged out successfully', null)
}

// GET /api/auth/logout
// Only for the area layouts: a signed-in user whose session cannot be confirmed (the token was
// revoked, the account was deleted) is signed out cleanly and sent to /login, instead of looping.
export async function GET(request: Request) {
  await clearSession()
  return NextResponse.redirect(new URL('/login', request.url))
}
