import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'

// Shell for the login, sign-up and password-reset pages: skip link, a slim top bar with the logo and
// the theme toggle, then the page.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <header className="border-b bg-background">
        <div className="page-container flex h-16 items-center justify-between">
          <BrandLogo />
          <ThemeToggle />
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
    </div>
  )
}
