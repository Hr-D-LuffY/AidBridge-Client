'use client'

import { Bell, LayoutDashboard, Loader2, LogOut, UserRound } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLogoutMutation, useSessionQuery } from '@/features/auth/auth.queries'
import { ROLE_HOME_PATH } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getNotificationsPath, getProfilePath } from './nav-config'
import { PublicUserMenu } from './public-user-menu'

type AuthActionsProps = {
  // Full-width stacked buttons, for the mobile menu. The default is the compact navbar row.
  stacked?: boolean
  onNavigate?: () => void
}

const STACKED_LINK =
  'flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50'

// These are real links styled as buttons. Base UI's <Button render={<Link />}> would put
// role="button" on the anchor, so a screen reader would announce "Log in" as a button.
// Right side of the public navbar. Logged out: Log in / Get started. Logged in: a Dashboard button and
// the profile menu (in the mobile menu, the same four places as a list). The width is reserved while
// the session loads, so the navbar never jumps.
export function AuthActions({ stacked = false, onNavigate }: AuthActionsProps) {
  const { data: session, isPending } = useSessionQuery()
  const logout = useLogoutMutation()
  const size = stacked ? 'h-11 w-full' : 'h-10 px-4'

  if (isPending) {
    return <Skeleton className={cn(stacked ? 'h-11 w-full' : 'h-10 w-24 sm:w-44')} />
  }

  if (session && stacked) {
    return (
      <ul className="flex flex-col gap-1">
        <li>
          <Link href={ROLE_HOME_PATH[session.role]} onClick={onNavigate} className={STACKED_LINK}>
            <LayoutDashboard aria-hidden="true" className="size-4" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link href={getProfilePath(session.role)} onClick={onNavigate} className={STACKED_LINK}>
            <UserRound aria-hidden="true" className="size-4" />
            Profile
          </Link>
        </li>
        <li>
          <Link
            href={getNotificationsPath(session.role)}
            onClick={onNavigate}
            className={STACKED_LINK}
          >
            <Bell aria-hidden="true" className="size-4" />
            Notifications
          </Link>
        </li>
        <li>
          <Button
            type="button"
            variant="ghost"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            className="min-h-11 w-full justify-start gap-2 px-3 text-destructive hover:text-destructive"
          >
            {logout.isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <LogOut aria-hidden="true" />
            )}
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </Button>
        </li>
      </ul>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href={ROLE_HOME_PATH[session.role]}
          className={cn(buttonVariants(), size, 'max-sm:hidden')}
        >
          <LayoutDashboard aria-hidden="true" />
          Dashboard
        </Link>
        <PublicUserMenu session={session} />
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2', stacked && 'flex-col')}>
      <Link
        href="/login"
        onClick={onNavigate}
        className={cn(
          buttonVariants({ variant: stacked ? 'outline' : 'ghost' }),
          size,
          !stacked && 'max-sm:hidden',
        )}
      >
        Log in
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className={cn(buttonVariants(), size, 'bg-cta text-cta-foreground hover:bg-cta/90')}
      >
        Get started
      </Link>
    </div>
  )
}
