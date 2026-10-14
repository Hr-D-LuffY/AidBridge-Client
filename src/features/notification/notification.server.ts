import 'server-only'
import { serverApi } from '@/lib/api/server'

// How many notifications the caller has not opened (GET /notifications/unread-count, X5).
export async function getUnreadNotificationCount(): Promise<number> {
  const { count } = await serverApi.get<{ count: number }>('/notifications/unread-count')
  return count
}
