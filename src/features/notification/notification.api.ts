import { clientApi } from '@/lib/api/client'
import type {
  AppNotification,
  Broadcast,
  CreateNotificationPayload,
  NotificationListParams,
  PaginationParams,
} from '@/types'

// What is addressed to me: everyone, my role, or me by name. Same for every role.
export const notificationApi = {
  list: (params: NotificationListParams, signal?: AbortSignal) =>
    clientApi.getList<AppNotification>('/notifications', params, signal),
  unreadCount: (signal?: AbortSignal) =>
    clientApi.get<{ count: number }>('/notifications/unread-count', undefined, signal),
  markRead: (id: string) => clientApi.put<AppNotification>(`/notifications/${id}/read`),
  // Admin: sends a notification to everyone or to some roles. An emergency broadcast also emails every
  // active account in those roles (the mail goes out after the save and never fails the request).
  // Admin: the history of what admins sent to roles, newest first, with how many people opened each.
  broadcasts: (params: PaginationParams, signal?: AbortSignal) =>
    clientApi.getList<Broadcast>('/notifications/broadcasts', params, signal),
  create: (payload: CreateNotificationPayload) =>
    clientApi.post<AppNotification>('/notifications', payload),
}
