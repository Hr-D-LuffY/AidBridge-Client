import { clientApi } from '@/lib/api/client'
import type {
  AppNotification,
  Broadcast,
  CreateNotificationPayload,
  MarkAllReadParams,
  NotificationListParams,
  NotificationPreferences,
  PaginationParams,
  UpdatePreferencesPayload,
} from '@/types'

// What is addressed to me: everyone, my role, or me by name. Same for every role.
export const notificationApi = {
  list: (params: NotificationListParams, signal?: AbortSignal) =>
    clientApi.getList<AppNotification>('/notifications', params, signal),
  unreadCount: (signal?: AbortSignal) =>
    clientApi.get<{ count: number }>('/notifications/unread-count', undefined, signal),
  markRead: (id: string) => clientApi.put<AppNotification>(`/notifications/${id}/read`),
  // Marks everything unread addressed to me (or one category of it) as read. Answers how many it changed.
  markAllRead: (params: MarkAllReadParams = {}) =>
    clientApi
      .request<{ count: number }>('/notifications/read-all', { method: 'PUT', query: params })
      .then((result) => result.data),
  // My in-app and email switches per category.
  preferences: (signal?: AbortSignal) =>
    clientApi.get<NotificationPreferences>('/notifications/preferences', undefined, signal),
  // Only the switches that change; the answer is the whole picture again.
  updatePreferences: (payload: UpdatePreferencesPayload) =>
    clientApi.put<NotificationPreferences>('/notifications/preferences', payload),
  // Admin: the history of what admins sent to roles, newest first, with how many people opened each.
  broadcasts: (params: PaginationParams, signal?: AbortSignal) =>
    clientApi.getList<Broadcast>('/notifications/broadcasts', params, signal),
  // Admin: sends a notification to everyone or to some roles. An emergency broadcast also emails every
  // active account in those roles (the mail goes out after the save and never fails the request).
  create: (payload: CreateNotificationPayload) =>
    clientApi.post<AppNotification>('/notifications', payload),
}
