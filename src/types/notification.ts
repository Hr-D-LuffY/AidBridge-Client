import type { PaginationParams } from './api'

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
