import { Role } from '@/types'

// Where a notification about one request opens, for the signed-in role. Only a victim and a volunteer
// are ever in a conversation, so only they get a link; the volunteer's page finds its task from the
// request's id.
export function getNotificationHref(role: Role, sosRequestId: string | null): string | null {
  if (!sosRequestId) return null
  if (role === Role.VICTIM) return `/dashboard/sos/${sosRequestId}`
  if (role === Role.VOLUNTEER) return `/volunteer/tasks/${sosRequestId}`
  return null
}
