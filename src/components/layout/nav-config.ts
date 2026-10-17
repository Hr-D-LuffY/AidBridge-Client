import {
  ChartColumn,
  ClipboardList,
  Flag,
  HandHeart,
  Info,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Mail,
  Map as MapIcon,
  Megaphone,
  PackageOpen,
  Radar,
  ScrollText,
  Siren,
  Tent,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react'
import { matchesPrefix } from '@/lib/auth/routes'
import { ROLE_HOME_PATH } from '@/lib/constants'
import { Role } from '@/types/enums'

// Links in the public navbar (PUBLIC_NAV) and the sidebar of each role's area (AREA_NAV).

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

// The links point at sections of the home page for now (/#id); Part "public site" replaces them with
// real pages (explore, guides, status) as those are built. Logged in or out, the navbar lists the same
// links; the profile menu is what changes.
export const PUBLIC_NAV: readonly NavEntry[] = [
  { type: 'link', href: '/', label: 'Home' },
  { type: 'link', href: '/#how-it-works', label: 'How it works' },
  { type: 'link', href: '/#guides', label: 'Guides' },
  { type: 'link', href: '/#faq', label: 'FAQ' },
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

export type AreaNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

// One list per role: the whole sidebar. The first item is always the area's overview. Pages reached
// from a row (a request's detail, a user's page) are not listed. Links to pages that a later part
// builds show the area's "not found" page until then. Notifications live in the top bar bell and
// Profile in the user menu, so neither is repeated here.
export const AREA_NAV: Record<Role, readonly AreaNavItem[]> = {
  [Role.VICTIM]: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/sos/new', label: 'Raise SOS', icon: Siren },
    { href: '/dashboard/sos', label: 'My requests', icon: ClipboardList },
    { href: '/dashboard/camps', label: 'Relief camps', icon: Tent },
    { href: '/dashboard/volunteer-request', label: 'Become a volunteer', icon: HandHeart },
  ],
  [Role.VOLUNTEER]: [
    { href: '/volunteer', label: 'Overview', icon: LayoutDashboard },
    { href: '/volunteer/nearby', label: 'Nearby requests', icon: Radar },
    { href: '/volunteer/tasks', label: 'My tasks', icon: ListChecks },
    { href: '/volunteer/camps', label: 'Relief camps', icon: Tent },
  ],
  [Role.NGO]: [
    { href: '/ngo', label: 'Overview', icon: LayoutDashboard },
    { href: '/ngo/camps', label: 'Camps', icon: Tent },
    { href: '/ngo/inventory', label: 'Inventory', icon: PackageOpen },
    { href: '/ngo/distribution', label: 'Distribution', icon: Truck },
    { href: '/ngo/live-map', label: 'Live map', icon: MapIcon },
  ],
  [Role.ADMIN]: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/volunteer-requests', label: 'Volunteer requests', icon: UserCheck },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/sos', label: 'SOS requests', icon: Siren },
    { href: '/admin/incidents', label: 'Incidents', icon: Flag },
    { href: '/admin/broadcasts', label: 'Broadcasts', icon: Megaphone },
    { href: '/admin/camps', label: 'Camps', icon: Tent },
    { href: '/admin/distribution', label: 'Distribution', icon: Truck },
    { href: '/admin/reports', label: 'Reports', icon: ChartColumn },
    { href: '/admin/live-map', label: 'Live map', icon: MapIcon },
    { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
  ],
}

// Every role has the same profile page under its own area (part 5).
export function getProfilePath(role: Role) {
  return `${ROLE_HOME_PATH[role]}/profile`
}

// ...and the same notifications page (the bell in the top bar links to it).
export function getNotificationsPath(role: Role) {
  return `${ROLE_HOME_PATH[role]}/notifications`
}

// The item that marks the current page: the longest href that the path equals or sits under, so on
// /dashboard/sos/new only "Raise SOS" is current, not "My requests" as well. The overview matches
// only its own URL, because every other page of the area is under it.
export function getActiveHref(pathname: string, role: Role): string | undefined {
  const items = AREA_NAV[role]
  const matches = items.filter((item) =>
    item.href === ROLE_HOME_PATH[role]
      ? pathname === item.href
      : matchesPrefix(pathname, item.href),
  )
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href
}
