import { CircleCheck, Moon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

type DutyFields = Pick<UserProfile, 'isAvailable' | 'isOnDuty' | 'onDutyUntil'>

// What the volunteer's duty looks like in words. `isOnDuty` is the backend's effective state (available
// AND the duty time is empty or still ahead), so it is never worked out here from the clock.
export function describeDuty({ isAvailable, isOnDuty, onDutyUntil }: DutyFields): string {
  if (isOnDuty) {
    return onDutyUntil
      ? `On duty until ${formatDateTime(onDutyUntil)}.`
      : 'On duty until you switch off.'
  }
  if (!isAvailable) return 'Off duty. Availability is switched off.'
  if (onDutyUntil) return `Off duty. Your duty time ended ${formatRelativeTime(onDutyUntil)}.`
  return 'Off duty.'
}

// "On duty" or "Off duty": the word, with an icon, never the colour alone.
export function DutyBadge({ isOnDuty, className }: { isOnDuty: boolean; className?: string }) {
  const Icon = isOnDuty ? CircleCheck : Moon
  return (
    <Badge
      variant="secondary"
      className={cn(
        'h-6 px-2.5',
        isOnDuty ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <Icon aria-hidden="true" />
      {isOnDuty ? 'On duty' : 'Off duty'}
    </Badge>
  )
}
