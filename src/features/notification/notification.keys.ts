import type { NotificationListParams, PaginationParams } from '@/types'

// One key factory for the notification queries. Plain module, like sos.keys.ts.
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationListParams) => [...notificationKeys.lists(), params] as const,
  // Admin: what was sent to roles.
  broadcasts: (params: PaginationParams) =>
    [...notificationKeys.all, 'broadcasts', params] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}
