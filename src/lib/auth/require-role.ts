import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { isApiError } from '@/lib/api/errors'
import { serverApi } from '@/lib/api/server'
import { ROLE_HOME_PATH } from '@/lib/constants'
import type { Role } from '@/types/enums'
import type { UserProfile } from '@/types/user'

// The live profile, read once per request however many layouts and pages ask. A 401 means the token
// no longer works (expired, password changed elsewhere, account deleted), which is "no session".
const getLiveProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    return await serverApi.get<UserProfile>('/auth/me')
  } catch (error) {
    if (isApiError(error) && error.isUnauthorized) return null
    throw error
  }
})

// Where the role is really enforced (proxy.ts only checks that a session exists). The area layouts
// call this with their own role and get the live profile back.
//
// The role comes from the database, not the token: an approved volunteer request changes it without
// a new token, so a new volunteer still holds a "victim" token. A wrong area sends the user to
// their own, and that area's layout then matches, so there is no redirect loop.
export async function requireRole(role: Role): Promise<UserProfile> {
  const profile = await getLiveProfile()
  // The logout route clears the dead cookies first. Sending a user with a dead token straight to
  // /login would bounce back here, because proxy.ts sends a signed-in user away from /login.
  if (!profile) redirect('/api/auth/logout')
  if (profile.role !== role) redirect(ROLE_HOME_PATH[profile.role])
  return profile
}
