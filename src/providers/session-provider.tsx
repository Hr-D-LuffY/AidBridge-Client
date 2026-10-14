'use client'

import { createContext, type ReactNode } from 'react'
import type { UserProfile } from '@/types/user'

// Who is logged in, for client components. Each area layout (dashboard, volunteer, ngo, admin) loads
// the live profile (GET /auth/me) on the server and passes it in. After a profile update,
// `router.refresh()` re-renders the layout with the new value, so there is no client copy to keep in sync.
export const SessionContext = createContext<UserProfile | null>(null)

export function SessionProvider({
  session,
  children,
}: {
  session: UserProfile
  children: ReactNode
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
