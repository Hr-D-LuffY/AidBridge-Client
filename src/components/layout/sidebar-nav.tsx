'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { AREA_NAV, getActiveHref } from './nav-config'

type SidebarNavProps = {
  // Closes the mobile drawer after a link is followed.
  onNavigate?: () => void
}

// The links for the signed-in user's role. The current page is marked by colour, weight and
// `aria-current`, not colour alone.
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { role } = useSession()
  const pathname = usePathname()
  const activeHref = getActiveHref(pathname, role)

  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2">
      <ul className="flex flex-col gap-1">
        {AREA_NAV[role].map(({ href, label, icon: Icon }) => {
          const active = href === activeHref
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-sidebar-ring/50',
                  active
                    ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                    : 'font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn('size-5 shrink-0', active && 'text-sidebar-primary')}
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
