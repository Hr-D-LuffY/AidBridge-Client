import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AppNotification } from '@/types'

// There is no unread-count endpoint, so ask for one unread item and read the total from `meta`
// (see AGENTS.md, notifications).
export async function getUnreadNotificationCount(): Promise<number> {
  const { meta } = await serverApi.getList<AppNotification>('/notifications', {
    unread: true,
    limit: 1,
  })
  return meta.total
}
