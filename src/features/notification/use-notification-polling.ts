'use client'

import { usePolling } from '@/hooks/use-polling'
import { useSession } from '@/hooks/use-session'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { Role } from '@/types'

// How often the bell and the notifications page look for new ones: every 15 seconds for a volunteer (an
// offer expires in minutes), every 30 for everyone else, and never while the tab is hidden.
export function useNotificationPolling(): number | false {
  const { role } = useSession()
  return usePolling(
    role === Role.VOLUNTEER
      ? POLL_INTERVAL_MS.volunteerNotifications
      : POLL_INTERVAL_MS.notifications,
  )
}
