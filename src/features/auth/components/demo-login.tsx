'use client'

import { HandHeart, LifeBuoy, Loader2, type LucideIcon, ShieldCheck, Tent } from 'lucide-react'
import { Role } from '@/types/enums'
import { useDemoLoginMutation } from '../auth.queries'
import { DEMO_ROLE_DESCRIPTION, DEMO_ROLE_LABEL, DEMO_ROLES, type DemoRole } from '../demo-roles'

const DEMO_ROLE_ICON: Record<DemoRole, LucideIcon> = {
  [Role.VICTIM]: LifeBuoy,
  [Role.VOLUNTEER]: HandHeart,
  [Role.NGO]: Tent,
  [Role.ADMIN]: ShieldCheck,
}

type DemoLoginProps = {
  // Roles whose demo account is configured on the server. The others are shown but disabled.
  availableRoles: readonly DemoRole[]
  redirect: string | undefined
}

// A boxed grid of one-click demo accounts. The browser only sends the role: the credentials are
// looked up on the server, so no password is ever in the page.
export function DemoLogin({ availableRoles, redirect }: DemoLoginProps) {
  const demo = useDemoLoginMutation(redirect)
  const busy = demo.isPending || demo.isSuccess

  return (
    <section
      aria-labelledby="demo-login-heading"
      className="rounded-xl border bg-muted/40 p-3 sm:p-4"
    >
      <h2 id="demo-login-heading" className="text-base">
        Demo accounts
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Try AidBridge in one click. No sign-up needed.
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {DEMO_ROLES.map((role) => {
          const Icon = DEMO_ROLE_ICON[role]
          const configured = availableRoles.includes(role)
          const loading = demo.isPending && demo.variables === role
          return (
            <li key={role} className="flex">
              <button
                type="button"
                disabled={busy || !configured}
                onClick={() => demo.mutate(role)}
                className="flex h-full w-full flex-col gap-1.5 rounded-lg border bg-card p-2.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:border-ring/50 enabled:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:p-3"
              >
                <span className="flex items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="text-sm font-semibold">{DEMO_ROLE_LABEL[role]}</span>
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {configured ? DEMO_ROLE_DESCRIPTION[role] : 'Not set up yet'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
