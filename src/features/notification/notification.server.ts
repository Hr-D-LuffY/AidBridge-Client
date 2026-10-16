import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AppNotification, NotificationListParams, Paginated } from '@/types'

// How many notifications the caller has not opened (GET /notifications/unread-count, X5).
export async function getUnreadNotificationCount(): Promise<number> {
  const { count } = await serverApi.get<{ count: number }>('/notifications/unread-count')
  return count
}

// A page of what is addressed to the caller (GET /notifications).
export function getNotificationPage(
  params: NotificationListParams,
): Promise<Paginated<AppNotification>> {
  return serverApi.getList<AppNotification>('/notifications', params)
}
