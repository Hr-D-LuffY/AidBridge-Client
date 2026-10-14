import { Info, type LucideIcon, Mail } from 'lucide-react'

// Links in the public navbar. The area sidebars get their own config in part 3.

export type NavItem = {
  href: string
  label: string
  description?: string
  icon?: LucideIcon
}

export type NavEntry =
  | { type: 'link'; href: string; label: string }
  // 'description': label plus a short line. 'icon': label with an icon.
  | { type: 'menu'; label: string; layout: 'description' | 'icon'; items: readonly NavItem[] }

export const PUBLIC_NAV: readonly NavEntry[] = [
  { type: 'link', href: '/', label: 'Home' },
  {
    type: 'menu',
    label: 'About',
    layout: 'icon',
    items: [
      { href: '/about', label: 'About us', icon: Info },
      { href: '/contact', label: 'Contact', icon: Mail },
    ],
  },
]
