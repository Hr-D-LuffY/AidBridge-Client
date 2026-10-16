import type { PaginationParams } from './api'
import type { NotificationTarget } from './enums'

export type AppNotification = {
  id: string
  title: string
  message: string
  isEmergencyBroadcast: boolean
  // The request it is about (a chat message), so it can be opened from here. Null for alerts and updates
  // that are not about one request.
  sosRequestId: string | null
  isRead: boolean
  createdAt: string
}

export type NotificationListParams = PaginationParams & {
  unread?: boolean
}

// POST /notifications (admin). `all` stands alone; an emergency broadcast also sends an email to every
// active account in the chosen roles.
export type CreateNotificationPayload = {
  title: string
  message: string
  targetRoles: NotificationTarget[]
  isEmergencyBroadcast: boolean
}
