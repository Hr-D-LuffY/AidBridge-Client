import {
  Ban,
  Briefcase,
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock,
  Flame,
  HandHeart,
  Hourglass,
  KeyRound,
  type LucideIcon,
  Navigation,
  ShieldCheck,
  Siren,
  TriangleAlert,
  UserRound,
  UserRoundCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  IncidentStatus,
  Priority,
  Role,
  SosStatus,
  TaskStatus,
  VolunteerRequestStatus,
} from '@/types/enums'

type Tone = 'success' | 'warning' | 'info' | 'high' | 'danger' | 'neutral'

type BadgeStyle = { label: string; tone: Tone; icon: LucideIcon }

// Which enum each `kind` reads its value from. `pending` and `on_the_way` exist in several enums, so
// the badge is keyed by enum first, then by value.
type StatusValues = {
  sos: SosStatus
  task: TaskStatus
  incident: IncidentStatus
  volunteerRequest: VolunteerRequestStatus
  role: Role
}

export type StatusKind = keyof StatusValues

// The colour of each tone, from the theme tokens. Critical and danger share the destructive red,
// which is also the brand red, so every entry carries an icon and a word and never relies on colour.
const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  high: 'bg-high-soft text-high',
  danger: 'bg-destructive-soft text-destructive',
  neutral: 'bg-muted text-muted-foreground',
}

// The one colour map for every enum in the app (design-system/aidbridge/MASTER.md).
const STATUS_STYLES: { [K in StatusKind]: Record<StatusValues[K], BadgeStyle> } = {
  sos: {
    pending: { label: 'Waiting for a volunteer', tone: 'warning', icon: Hourglass },
    assigned: { label: 'Volunteer assigned', tone: 'info', icon: UserRoundCheck },
    on_the_way: { label: 'Help is on the way', tone: 'high', icon: Navigation },
    rescued: { label: 'Rescued', tone: 'success', icon: CheckCheck },
    closed: { label: 'Closed', tone: 'neutral', icon: Ban },
  },
  task: {
    pending: { label: 'Pending', tone: 'warning', icon: Hourglass },
    accepted: { label: 'Accepted', tone: 'info', icon: CircleCheck },
    rejected: { label: 'Declined', tone: 'neutral', icon: CircleX },
    on_the_way: { label: 'On the way', tone: 'high', icon: Navigation },
    completed: { label: 'Completed', tone: 'success', icon: CheckCheck },
    cancelled: { label: 'Cancelled', tone: 'neutral', icon: Ban },
    expired: { label: 'Expired', tone: 'neutral', icon: Clock },
  },
  incident: {
    active: { label: 'Active', tone: 'high', icon: Flame },
    resolved: { label: 'Resolved', tone: 'success', icon: CheckCheck },
  },
  volunteerRequest: {
    pending: { label: 'Under review', tone: 'warning', icon: Clock },
    approved: { label: 'Approved', tone: 'success', icon: ShieldCheck },
    rejected: { label: 'Not approved', tone: 'neutral', icon: CircleX },
  },
  role: {
    victim: { label: 'Victim', tone: 'info', icon: UserRound },
    volunteer: { label: 'Volunteer', tone: 'success', icon: HandHeart },
    ngo: { label: 'NGO', tone: 'high', icon: Briefcase },
    admin: { label: 'Admin', tone: 'neutral', icon: KeyRound },
  },
}

const PRIORITY_STYLES: Record<Priority, BadgeStyle> = {
  low: { label: 'Low', tone: 'info', icon: CircleCheck },
  medium: { label: 'Medium', tone: 'warning', icon: TriangleAlert },
  high: { label: 'High', tone: 'high', icon: TriangleAlert },
  critical: { label: 'Critical', tone: 'danger', icon: Siren },
}

function Pill({ style, className }: { style: BadgeStyle; className?: string }) {
  const { label, tone, icon: Icon } = style
  return (
    <Badge variant="secondary" className={cn('h-6 px-2.5', TONE_CLASSES[tone], className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  )
}

type StatusBadgeProps<K extends StatusKind> = {
  kind: K
  status: StatusValues[K]
  className?: string
}

// A coloured pill for any backend status enum, e.g. <StatusBadge kind="sos" status="on_the_way" />.
// Plain markup with no hooks, so Server and Client Components can both render it.
export function StatusBadge<K extends StatusKind>({
  kind,
  status,
  className,
}: StatusBadgeProps<K>) {
  const styles: Record<StatusValues[K], BadgeStyle> = STATUS_STYLES[kind]
  return <Pill style={styles[status]} className={className} />
}

// The same pill for a priority (SOS requests and incidents share the four levels).
export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return <Pill style={PRIORITY_STYLES[priority]} className={className} />
}
