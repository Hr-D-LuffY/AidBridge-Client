import { Role } from '@/types/enums'

// Where each role lands after login, and the URL prefix that only that role may open.
export const ROLE_HOME_PATH: Record<Role, string> = {
  [Role.VICTIM]: '/dashboard',
  [Role.VOLUNTEER]: '/volunteer',
  [Role.NGO]: '/ngo',
  [Role.ADMIN]: '/admin',
}

export const ROLE_PATH_PREFIX: Record<Role, string> = ROLE_HOME_PATH

// Only for visitors who are not logged in; a logged-in user is sent to their own area.
export const GUEST_ONLY_PATHS = ['/login', '/register', '/forgot-password']

export const ROLE_LABEL: Record<Role, string> = {
  [Role.VICTIM]: 'Victim',
  [Role.VOLUNTEER]: 'Volunteer',
  [Role.NGO]: 'NGO',
  [Role.ADMIN]: 'Admin',
}

// Session cookies, both httpOnly on the frontend domain (see AGENTS.md, Architecture).
export const TOKEN_COOKIE = 'ab_token'
export const SESSION_COOKIE = 'ab_session'

// Pagination: the backend defaults to 10 and caps at 100.
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// Password rules (backend: auth.interface.ts).
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

// Search inputs wait this long after the last keystroke before updating the URL.
export const SEARCH_DEBOUNCE_MS = 400
