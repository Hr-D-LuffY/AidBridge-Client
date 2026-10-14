import 'server-only'
import { DEMO_ROLES, type DemoRole } from '@/features/auth/demo-roles'
import { env } from '@/lib/env'
import { Role } from '@/types/enums'

// Demo logins live in server-only env vars, so no password ever reaches the browser bundle.
// A role whose email or password is blank has no demo account and a disabled button.

type Credentials = { email: string; password: string }

const SOURCES: Record<DemoRole, { email?: string; password?: string }> = {
  [Role.VICTIM]: { email: env.DEMO_VICTIM_EMAIL, password: env.DEMO_VICTIM_PASSWORD },
  [Role.VOLUNTEER]: { email: env.DEMO_VOLUNTEER_EMAIL, password: env.DEMO_VOLUNTEER_PASSWORD },
  [Role.NGO]: { email: env.DEMO_NGO_EMAIL, password: env.DEMO_NGO_PASSWORD },
  [Role.ADMIN]: { email: env.DEMO_ADMIN_EMAIL, password: env.DEMO_ADMIN_PASSWORD },
}

export function getDemoCredentials(role: DemoRole): Credentials | null {
  const { email, password } = SOURCES[role]
  return email && password ? { email, password } : null
}

// Safe to send to the browser: role names only, never the credentials.
export function getAvailableDemoRoles(): DemoRole[] {
  return DEMO_ROLES.filter((role) => getDemoCredentials(role) !== null)
}
