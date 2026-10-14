import { clientApi } from '@/lib/api/client'
import type { AppNotification, NotificationListParams } from '@/types'

// What is addressed to me: everyone, my role, or me by name. Same for every role.
export const notificationApi = {
  list: (params: NotificationListParams, signal?: AbortSignal) =>
    clientApi.getList<AppNotification>('/notifications', params, signal),
  unreadCount: (signal?: AbortSignal) =>
    clientApi.get<{ count: number }>('/notifications/unread-count', undefined, signal),
  markRead: (id: string) => clientApi.put<AppNotification>(`/notifications/${id}/read`),
}
