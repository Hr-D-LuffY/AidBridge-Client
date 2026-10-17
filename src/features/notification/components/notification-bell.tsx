'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getNotificationsPath } from '@/components/layout/nav-config'
import { buttonVariants } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { useUnreadCountQuery } from '../notification.queries'
import { useNotificationPolling } from '../use-notification-polling'

// The bell in the top bar: a link to the notifications page with the unread number on it. The number is
// asked for again every 15 seconds (volunteers) or 30 (everyone else) while the tab is visible, because
// the backend has no websockets. When the number goes up, one toast says how many new ones arrived (never
// one per notification), unless the notifications page is already open.
export function NotificationBell() {
  const { role } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const poll = useNotificationPolling()
  const { data } = useUnreadCountQuery(poll)
  const count = data ?? 0
  const path = getNotificationsPath(role)
  const lastCount = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (data === undefined) return
    const before = lastCount.current
    lastCount.current = data
    // The first answer is not news, and neither is the number going down (something was read).
    if (before === undefined || data <= before || pathname === path) return
    const added = data - before
    toast.info(
      added === 1 ? 'You have a new notification.' : `You have ${added} new notifications.`,
      {
        // The same id, so a newer batch replaces the toast instead of stacking another one.
        id: 'new-notifications',
        action: { label: 'View', onClick: () => router.push(path) },
      },
    )
  }, [data, pathname, path, router])

  return (
    <Link
      href={path}
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
