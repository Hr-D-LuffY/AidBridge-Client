import { TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { StripeDivider } from '@/components/motion/stripe-divider'
import { SITE_AUTHOR, SOCIAL_LINKS } from '@/lib/site-config'
import { BrandLogo } from './brand-logo'
import { SocialIcon } from './social-icon'

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Log in', href: '/login' },
  { label: 'Sign up', href: '/register' },
] as const

// Centred footer: logo, tagline, links, a safety note, credit and social icons, a sliding striped
// divider, copyright. AidBridge coordinates help; it does not replace the emergency services, and a
// page for people in crisis must say so.
export function PublicFooter() {
  return (
    <footer className="w-full overflow-hidden border-t border-border bg-card pt-10 pb-5 text-foreground">
      <Stagger className="page-container mb-8 flex flex-col items-center gap-6">
        <StaggerItem className="flex flex-col items-center gap-3">
          <BrandLogo size="lg" />
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Bridging people in crisis with the help they need.
          </p>
        </StaggerItem>

        <StaggerItem>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </StaggerItem>

        <StaggerItem>
          <p className="flex max-w-xl items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <span>
              In immediate danger, call your local emergency number first. AidBridge does not
              replace the emergency services.
            </span>
          </p>
        </StaggerItem>

        <StaggerItem className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Made by <span className="font-medium text-foreground">{SITE_AUTHOR}</span>
          </p>
          {SOCIAL_LINKS.length > 0 && (
            <ul className="flex items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    aria-label={`${link.label} (opens in a new tab)`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <SocialIcon id={link.id} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </StaggerItem>
      </Stagger>

      <StripeDivider />

      {/* Plain text on purpose: it is the last line of the page, so a scroll-reveal would never fire. */}
      <p className="page-container mt-5 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} AidBridge. All rights reserved.
      </p>
    </footer>
  )
}
