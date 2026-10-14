'use client'

import type { ReactNode } from 'react'
import { useSession } from '@/hooks/use-session'
import type { Role } from '@/types/enums'

type RoleGateProps = {
  allow: readonly Role[]
  // Shown to the other roles. Nothing by default.
  fallback?: ReactNode
  children: ReactNode
}

// The third layer of role checks (after proxy.ts and the area layout): buttons and sections that
// only some roles may use, e.g. "Raise SOS" for victims. It hides things, it does not secure
// them; the backend refuses a wrong-role request anyway.
export function RoleGate({ allow, fallback = null, children }: RoleGateProps) {
  const { role } = useSession()
  return allow.includes(role) ? children : fallback
}
