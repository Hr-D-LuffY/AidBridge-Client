import Link from 'next/link'
import type { ReactNode } from 'react'
import { BridgeBackdrop } from '@/components/motion/bridge-backdrop'
import { cn } from '@/lib/utils'

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

type AuthCardProps = {
  mode: AuthMode
  // The page the user was sent here from. Kept when they switch between the two tabs.
  redirect?: string
  children: ReactNode
}

const HEADINGS: Record<AuthMode, { title: string; text: string }> = {
  login: { title: 'Welcome back', text: 'Log in or create an account' },
  register: { title: 'Create your account', text: 'Log in or create an account' },
  'forgot-password': {
    title: 'Forgot password?',
    text: 'Enter your account email and we will send you a reset link.',
  },
  'reset-password': {
    title: 'Choose a new password',
    text: 'Pick a password you have not used here before.',
  },
}

// The shell for every account page: a centred card with a Log In / Sign Up switch. The logo's bridge
// is drawn large behind the card, so it frames the form from every side. Forgot-password and
// reset-password use the card without the switch.
export function AuthCard({ mode, redirect, children }: AuthCardProps) {
  const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
  const hasTabs = mode === 'login' || mode === 'register'
  const tabs = [
    { mode: 'login', href: `/login${query}`, label: 'Log In' },
    { mode: 'register', href: `/register${query}`, label: 'Sign Up' },
  ] as const
  const heading = HEADINGS[mode]

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-start justify-center overflow-hidden bg-linear-to-b from-secondary to-background px-4 py-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_50%_at_50%_35%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
      />
      {/* The whole bridge fits on the first screen: its height comes from the viewport height and it is
          pinned near the top, so the deck is never below the fold. It is made bigger by being wider
          (about a third wider than the logo), not taller. The card sits in front of its middle. */}
      <BridgeBackdrop
        stretch
        className="top-3 left-1/2 aspect-[1.1] h-[min(calc(100dvh-5.75rem),760px)] w-auto -translate-x-1/2 opacity-70 dark:opacity-80"
      />
      <div className="relative w-full max-w-[440px]">
        <div className="relative flex flex-col gap-5">
          <div className="rounded-2xl border bg-card p-6 shadow-float sm:p-8">
            <h1 className="text-3xl">{heading.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{heading.text}</p>

            {hasTabs && (
              <nav
                aria-label="Account"
                className="mt-6 grid grid-cols-2 gap-1 rounded-xl border bg-background p-1"
              >
                {tabs.map((tab) => {
                  const active = tab.mode === mode
                  return (
                    <Link
                      key={tab.mode}
                      href={tab.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'grid h-11 place-items-center rounded-lg border text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                        active
                          ? 'border-border bg-card text-foreground shadow-soft'
                          : 'border-transparent text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tab.label}
                    </Link>
                  )
                })}
              </nav>
            )}

            <div className="mt-6">{children}</div>
          </div>

          <p className="text-center text-sm">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full bg-card/80 px-4 font-medium text-foreground outline-none backdrop-blur hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
