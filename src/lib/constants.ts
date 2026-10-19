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
  sosStatus: 15_000,
  // A volunteer waiting for work: new requests appear without a reload.
  nearby: 30_000,
  notifications: 30_000,
  // A volunteer's offers expire in minutes, so their bell looks twice as often (decision A14).
  volunteerNotifications: 15_000,
  // Offers last at least 5 minutes (critical) and usually 15, so a volunteer's list looks every 15 s.
  offers: 15_000,
  // An NGO watching camps and open requests on the live map.
  liveMap: 30_000,
} as const

// Chat: the backend caps a message at 500 characters and a page at 100 (newest first).
export const CHAT_MESSAGE_MAX_LENGTH = 500
export const CHAT_PAGE_SIZE = 100

// Rating a volunteer: whole stars from 1 to this.
export const RATING_MAX = 5

export const NOTIFICATION_PAGE_SIZE = 10

// SOS field rules and limits (backend: constants/sos.ts, volunteer-request.interface.ts).
export const SOS_DESCRIPTION_MAX_LENGTH = 1000
export const SOS_ADDRESS_MAX_LENGTH = 300
export const SOS_RESOLVE_REASON_MAX_LENGTH = 500
export const MAX_ACTIVE_SOS = 3
export const VOLUNTEER_REQUEST_MIN_LENGTH = 10
export const VOLUNTEER_REQUEST_MAX_LENGTH = 500

// Nearby camps: the backend caps the radius at 50 km.
export const CAMP_RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const
export const DEFAULT_CAMP_RADIUS_KM = 10

// Volunteers (backend: constants/task.ts, constants/distribution.ts, constants/inventory.ts).
export const MAX_ACTIVE_TASKS = 3
export const SOS_RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const
export const DEFAULT_SOS_RADIUS_KM = 10
// The nearest requests asked for at once (the backend allows up to 100 a page).
export const NEARBY_PAGE_SIZE = 50
export const TASK_HISTORY_PAGE_SIZE = 10
export const DISTRIBUTION_NOTES_MAX_LENGTH = 500
export const MAX_STOCK_QUANTITY = 1_000_000_000

// NGOs (backend: constants/camp.ts, constants/inventory.ts).
export const CAMP_NAME_MIN_LENGTH = 2
export const CAMP_NAME_MAX_LENGTH = 100
export const CAMP_ADDRESS_MAX_LENGTH = 300
export const MAX_CAMP_CAPACITY = 1_000_000
export const ITEM_NAME_MAX_LENGTH = 100
export const ITEM_UNIT_MAX_LENGTH = 20
export const DEFAULT_LOW_STOCK_THRESHOLD = 10
export const DEFAULT_STOCK_UNIT = 'units'
export const NGO_PAGE_SIZE = 10
// How many low-stock items and recent hand-outs the overview lists before linking to the full page.
export const OVERVIEW_PREVIEW_SIZE = 5
// The people a camp's check-in buttons add or remove at once.
export const OCCUPANCY_STEPS = [-10, -1, 1, 10] as const

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

// Admins (backend: volunteer-request.interface.ts, constants/incident.ts, constants/notification.ts).
export const ADMIN_PAGE_SIZE = 10
export const REVIEW_NOTE_MAX_LENGTH = 500
export const BLOCK_REASON_MAX_LENGTH = 500
export const INCIDENT_TITLE_MIN_LENGTH = 3
export const INCIDENT_TITLE_MAX_LENGTH = 150
export const INCIDENT_DESCRIPTION_MAX_LENGTH = 2000
export const INCIDENT_ADDRESS_MAX_LENGTH = 300
// Requests that can be linked to an incident, or taken off one, in a single call.
export const MAX_SOS_LINKS_PER_CALL = 50
export const BROADCAST_TITLE_MAX_LENGTH = 150
export const BROADCAST_MESSAGE_MAX_LENGTH = 2000
