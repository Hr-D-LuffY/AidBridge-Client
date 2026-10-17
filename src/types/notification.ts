import type { PaginationParams } from './api'
import type { NotificationCategory, NotificationTarget, NotificationType } from './enums'

export type AppNotification = {
  id: string
  // A plain string because later steps add values; an unknown one is shown as `general`.
  type: NotificationType | (string & {})
  category: NotificationCategory | (string & {})
  title: string
  message: string
  isEmergencyBroadcast: boolean
  // The request it is about (a chat message), so it can be opened from here. Null for alerts and updates
  // that are not about one request.
  sosRequestId: string | null
  // The camp it is about (low stock), so it can be opened from here. Null for everything else.
  campId: string | null
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

// One line of the admin's broadcast history (GET /notifications/broadcasts): what an admin sent to roles.
// `readCount` is how many people opened it, never who. `sentBy` is null when that account is gone.
export type Broadcast = {
  id: string
  title: string
  message: string
  targetRoles: NotificationTarget[]
  isEmergencyBroadcast: boolean
  sentBy: { id: string; name: string } | null
  readCount: number
  createdAt: string
}
