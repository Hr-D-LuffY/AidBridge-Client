'use client'

import { Bell, ChevronDown, LayoutDashboard, Loader2, LogOut, UserRound } from 'lucide-react'
import Link from 'next/link'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogoutMutation } from '@/features/auth/auth.queries'
import { ROLE_HOME_PATH, ROLE_LABEL } from '@/lib/constants'
import type { SessionUser } from '@/types/user'
import { getNotificationsPath, getProfilePath } from './nav-config'

// The profile menu of the public navbar for a signed-in visitor: where to go (dashboard, profile,
// notifications) and Log out. The dashboard's own menu needs the full profile from an area layout, so
// this one works from the small session the navbar already has.
export function PublicUserMenu({ session }: { session: SessionUser }) {
  const logout = useLogoutMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-11 gap-2 px-2" />}>
        <UserAvatar name={session.name} />
        <span className="sr-only">Account menu for {session.name}</span>
        <span aria-hidden="true" className="max-w-28 truncate text-sm font-medium max-lg:hidden">
          {session.name}
        </span>
        <ChevronDown aria-hidden="true" className="text-muted-foreground max-sm:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-2">
            <span className="truncate text-sm font-semibold text-foreground">{session.name}</span>
            <span className="text-xs font-medium text-link">{ROLE_LABEL[session.role]}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href={ROLE_HOME_PATH[session.role]} />}
          className="min-h-10 gap-2 px-2"
        >
          <LayoutDashboard aria-hidden="true" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={getProfilePath(session.role)} />}
          className="min-h-10 gap-2 px-2"
        >
          <UserRound aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={getNotificationsPath(session.role)} />}
          className="min-h-10 gap-2 px-2"
        >
          <Bell aria-hidden="true" />
          Notifications
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          closeOnClick={false}
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="min-h-10 gap-2 px-2"
        >
          {logout.isPending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          {logout.isPending ? 'Logging out…' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
