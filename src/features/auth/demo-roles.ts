import { Role } from '@/types/enums'

// The one-click demo accounts on the login page: one per backend role.
export const DEMO_ROLES = [Role.VICTIM, Role.VOLUNTEER, Role.NGO, Role.ADMIN] as const
export type DemoRole = (typeof DEMO_ROLES)[number]

export const DEMO_ROLE_LABEL: Record<DemoRole, string> = {
  [Role.VICTIM]: 'Person in need',
  [Role.VOLUNTEER]: 'Volunteer',
  [Role.NGO]: 'NGO',
  [Role.ADMIN]: 'Admin',
}

export const DEMO_ROLE_DESCRIPTION: Record<DemoRole, string> = {
  [Role.VICTIM]: 'Raise an SOS and chat with a volunteer',
  [Role.VOLUNTEER]: 'Accept nearby requests and deliver aid',
  [Role.NGO]: 'Run camps, stock and distribution',
  [Role.ADMIN]: 'Manage incidents, people and analytics',
}
