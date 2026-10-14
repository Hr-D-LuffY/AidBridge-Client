import type { PaginationParams } from './api'

export type AppNotification = {
  id: string
  title: string
  message: string
  isEmergencyBroadcast: boolean
  isRead: boolean
  createdAt: string
}

export type NotificationListParams = PaginationParams & {
  unread?: boolean
}
