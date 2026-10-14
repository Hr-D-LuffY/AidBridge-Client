'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { getNotificationsPath } from '@/components/layout/nav-config'
import { buttonVariants } from '@/components/ui/button'
import { usePolling } from '@/hooks/use-polling'
import { useSession } from '@/hooks/use-session'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useUnreadCountQuery } from '../notification.queries'

// The bell in the top bar: a link to the notifications page with the unread number on it. The number
// is asked for again every 30 seconds while the tab is visible (the backend has no websockets).
export function NotificationBell() {
  const { role } = useSession()
  const poll = usePolling(POLL_INTERVAL_MS.notifications)
  const { data: count = 0 } = useUnreadCountQuery(poll)

  return (
    <Link
      href={getNotificationsPath(role)}
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'relative')}
    >
      <Bell aria-hidden="true" className="size-4" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] leading-5 font-bold text-primary-foreground tabular-nums ring-2 ring-background"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
