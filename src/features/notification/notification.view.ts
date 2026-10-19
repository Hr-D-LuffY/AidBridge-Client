import {
  Ban,
  Bell,
  BellRing,
  CheckCheck,
  CircleX,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Navigation,
  PackageOpen,
  Pencil,
  ShieldCheck,
  TimerOff,
  TriangleAlert,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react'
import { type AppNotification, NotificationCategory, NotificationType, Role } from '@/types'

// How a notification looks and where it leads, in one place (like the status badges): an icon and a tone
// per type, a heading per category. An unknown type or category reads as `general` / `system`, because
// later backend steps add values.

type Tone = 'info' | 'success' | 'warning' | 'high' | 'danger' | 'neutral'

// The icon tile's colours, from the theme tokens. Every notification also carries its title, so colour is
// never the only signal.
export const TONE_CLASSES: Record<Tone, string> = {
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  high: 'bg-high-soft text-high',
  danger: 'bg-destructive-soft text-destructive',
  neutral: 'bg-muted text-muted-foreground',
}

type TypeStyle = { icon: LucideIcon; tone: Tone }

const TYPE_STYLES: Record<NotificationType, TypeStyle> = {
  [NotificationType.GENERAL]: { icon: Bell, tone: 'neutral' },
  [NotificationType.BROADCAST]: { icon: Megaphone, tone: 'danger' },
  [NotificationType.CHAT_MESSAGE]: { icon: MessageSquare, tone: 'info' },
  [NotificationType.SOS_ASSIGNED]: { icon: UserRoundCheck, tone: 'info' },
  [NotificationType.SOS_ON_THE_WAY]: { icon: Navigation, tone: 'high' },
  [NotificationType.SOS_RESCUED]: { icon: CheckCheck, tone: 'success' },
  [NotificationType.SOS_UPDATED]: { icon: Pencil, tone: 'warning' },
  [NotificationType.TASK_CANCELLED]: { icon: Ban, tone: 'danger' },
  [NotificationType.VOLUNTEER_BACKED_OUT]: { icon: UserRoundX, tone: 'warning' },
  [NotificationType.VOLUNTEER_REQUEST_APPROVED]: { icon: ShieldCheck, tone: 'success' },
  [NotificationType.VOLUNTEER_REQUEST_REJECTED]: { icon: CircleX, tone: 'neutral' },
  [NotificationType.INVENTORY_LOW]: { icon: PackageOpen, tone: 'warning' },
  [NotificationType.TASK_OFFERED]: { icon: BellRing, tone: 'high' },
  [NotificationType.OFFER_EXPIRED]: { icon: TimerOff, tone: 'neutral' },
  [NotificationType.SOS_UNSERVED]: { icon: TriangleAlert, tone: 'danger' },
}

function isOneOf<T extends string>(map: Record<T, unknown>, key: string): key is T {
  return key in map
}

export function getNotificationStyle(type: string): TypeStyle {
  return isOneOf(TYPE_STYLES, type) ? TYPE_STYLES[type] : TYPE_STYLES[NotificationType.GENERAL]
}

// The order the page lists the groups in: what is happening to my requests first.
export const CATEGORY_ORDER: readonly NotificationCategory[] = [
  NotificationCategory.REQUESTS,
  NotificationCategory.TASKS,
  NotificationCategory.SAFETY,
  NotificationCategory.CAMPS,
  NotificationCategory.SYSTEM,
]

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  [NotificationCategory.REQUESTS]: 'Requests',
  [NotificationCategory.TASKS]: 'Tasks',
  [NotificationCategory.SAFETY]: 'Safety',
  [NotificationCategory.CAMPS]: 'Camps and stock',
  [NotificationCategory.SYSTEM]: 'Announcements and account',
}

// What each group holds, in a line, for the preferences card.
export const CATEGORY_HELP: Record<NotificationCategory, string> = {
  [NotificationCategory.REQUESTS]:
    'A volunteer accepted, is on the way or has rescued you, and new chat messages.',
  [NotificationCategory.TASKS]:
    'Offers to help, and changes to the tasks you are doing, such as the request being edited.',
  [NotificationCategory.CAMPS]: 'Alerts about your camps, such as an item running low.',
  [NotificationCategory.SAFETY]:
    'Safety news, such as a volunteer backing out of your request, or a request nobody could be found for.',
  [NotificationCategory.SYSTEM]:
    'Announcements from administrators and the decision on a volunteer request.',
}

// A rule worth saying next to a switch. Tasks can be switched off, but a cancelled task always arrives.
export const CATEGORY_NOTE: Partial<Record<NotificationCategory, string>> = {
  [NotificationCategory.TASKS]:
    'Switching this off stops the optional updates. If a task is cancelled you are always told.',
}

export function getNotificationCategory(category: string): NotificationCategory {
  return CATEGORY_ORDER.find((known) => known === category) ?? NotificationCategory.SYSTEM
}

// Splits one page of notifications into its groups, in CATEGORY_ORDER, leaving out the empty ones. Inside
// a group the order stays newest first.
export function groupByCategory(items: readonly AppNotification[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => getNotificationCategory(item.category) === category),
  })).filter((group) => group.items.length > 0)
}

export type NotificationLink = { href: string; label: string }

// Where a notification opens for the signed-in role, with the words for the button, or null when there
// is nowhere to go. The request page is the victim's, the task page the volunteer's (it finds its task
// from the request's id) and the admin's own request page; an NGO has no request page, so its only link is
// a camp's low stock, which opens that camp's low items in the inventory.
export function getNotificationLink(
  role: Role,
  notification: Pick<AppNotification, 'type' | 'sosRequestId' | 'campId'>,
): NotificationLink | null {
  const { sosRequestId, campId, type } = notification
  if (sosRequestId) {
    const conversation = type === NotificationType.CHAT_MESSAGE
    if (role === Role.VICTIM) {
      return {
        href: `/dashboard/sos/${sosRequestId}`,
        label: conversation ? 'Open the conversation' : 'Open the request',
      }
    }
    if (role === Role.VOLUNTEER && type === NotificationType.TASK_OFFERED) {
      // The offer is not a task yet, so it has no task page: the offers panel on the overview holds it.
      return { href: '/volunteer#offers', label: 'See the offer' }
    }
    if (role === Role.VOLUNTEER && type === NotificationType.OFFER_EXPIRED) {
      // An expired offer stays on the volunteer's map until someone takes it.
      return { href: `/volunteer/nearby/${sosRequestId}`, label: 'See the request' }
    }
    if (role === Role.VOLUNTEER) {
      return {
        href: `/volunteer/tasks/${sosRequestId}`,
        label: conversation ? 'Open the conversation' : 'Open the task',
      }
    }
    if (role === Role.ADMIN) {
      return { href: `/admin/sos/${sosRequestId}`, label: 'Open the request' }
    }
  }
  if (campId && role === Role.NGO) {
    return { href: `/ngo/inventory?camp=${campId}&low=1`, label: 'See the low stock' }
  }
  return null
}
