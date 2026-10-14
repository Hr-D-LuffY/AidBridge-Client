import { ROLE_PATH_PREFIX } from '@/lib/constants'
import { Role } from '@/types/enums'

// Which role owns which URL area. Shared by proxy.ts (the route guard) and the post-login redirect.

export function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

// The one role allowed under this path, or null for a public page.
export function requiredRole(pathname: string): Role | null {
  for (const role of Object.values(Role)) {
    if (matchesPrefix(pathname, ROLE_PATH_PREFIX[role])) return role
  }
  return null
}
