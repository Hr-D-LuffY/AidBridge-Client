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

// Account field rules (backend: user.interface.ts).
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72
export const PHONE_PATTERN = /^\+?[0-9]{7,15}$/

// A password-reset link carries a 64-character hex token (backend: auth.interface.ts).
export const RESET_TOKEN_PATTERN = /^[0-9a-f]{64}$/

// Search inputs wait this long after the last keystroke before updating the URL.
export const SEARCH_DEBOUNCE_MS = 400

// The backend has no websockets, so these screens poll (see hooks/use-polling.ts).
export const POLL_INTERVAL_MS = {
  chat: 5_000,
  notifications: 30_000,
} as const

// SOS media rules (backend: constants/sos.ts). Checked in the browser first so a bad file is
// refused before the upload starts.
export const MEDIA_MAX_FILES = 5
export const MEDIA_MAX_BYTES = 10 * 1024 * 1024
export const MEDIA_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
] as const
