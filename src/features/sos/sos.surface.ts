import { SosStatus } from '@/types'

// Each status has its own colour, the same hue as its badge (MASTER.md): waiting = amber, taken = blue,
// on the way = orange, rescued = green, closed = grey. The card washes its background with it, and the
// status filter shows a swatch of the same colour, so a user can tell what a card's colour means.
// Class names are written out in full so Tailwind can see them.

// The background and border of a request card.
export const STATUS_SURFACE: Record<SosStatus, string> = {
  [SosStatus.PENDING]:
    'border-warning/40 bg-linear-to-br from-warning-soft via-warning-soft/40 to-card',
  [SosStatus.ASSIGNED]: 'border-info/40 bg-linear-to-br from-info-soft via-info-soft/40 to-card',
  [SosStatus.ON_THE_WAY]: 'border-high/40 bg-linear-to-br from-high-soft via-high-soft/40 to-card',
  [SosStatus.RESCUED]:
    'border-success/40 bg-linear-to-br from-success-soft via-success-soft/40 to-card',
  [SosStatus.CLOSED]: 'border-border bg-linear-to-br from-muted via-muted/40 to-card',
}

// A small round sample of the same gradient, a little stronger so it reads at 16 px.
export const STATUS_SWATCH: Record<SosStatus, string> = {
  [SosStatus.PENDING]: 'border-warning/60 bg-linear-to-br from-warning-soft to-warning/50',
  [SosStatus.ASSIGNED]: 'border-info/60 bg-linear-to-br from-info-soft to-info/50',
  [SosStatus.ON_THE_WAY]: 'border-high/60 bg-linear-to-br from-high-soft to-high/50',
  [SosStatus.RESCUED]: 'border-success/60 bg-linear-to-br from-success-soft to-success/50',
  [SosStatus.CLOSED]: 'border-border bg-linear-to-br from-muted to-muted-foreground/40',
}
