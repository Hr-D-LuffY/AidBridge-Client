'use client'

import { Menu } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NotificationBell } from '@/features/notification/components/notification-bell'
import { useSession } from '@/hooks/use-session'
import { ROLE_LABEL } from '@/lib/constants'
import { BrandLogo } from './brand-logo'
import { SidebarNav } from './sidebar-nav'
import { UserMenu } from './user-menu'

// Frame for the four signed-in areas (/dashboard, /volunteer, /ngo, /admin): a fixed sidebar from
// 1024 px up, a slide-in drawer below that, a top bar with the theme toggle and the user menu, and
// the page. The sidebar comes from the session role, so each role sees only its own links.
export function AreaShell({ children }: { children: ReactNode }) {
  const { role } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const roleLabel = ROLE_LABEL[role]

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 shrink-0 items-center px-4">
          <BrandLogo />
        </div>
        <p className="px-6 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {roleLabel}
        </p>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 lg:hidden"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
            <BrandLogo className="lg:hidden" />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none md:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="h-16 justify-center border-b px-4 py-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <BrandLogo />
          </SheetHeader>
          <p className="px-6 pt-4 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {roleLabel}
          </p>
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
