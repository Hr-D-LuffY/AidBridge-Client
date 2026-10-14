import { cn } from '@/lib/utils'
import type { CampSummary } from '@/types'
import { isCampFull } from '../camp.view'

// How full a camp is, as a thin bar (green with room, amber when full). The percentage is also in the
// accessible name, so the colour is never the only signal. Plain markup with no hooks.
export function OccupancyBar({
  camp,
}: {
  camp: Pick<CampSummary, 'name' | 'capacity' | 'currentOccupancy' | 'availableSpots'>
}) {
  const full = isCampFull(camp)
  const filled = Math.min(100, Math.round((camp.currentOccupancy / camp.capacity) * 100))

  return (
    <div
      role="progressbar"
      aria-label={`${camp.name} is ${filled}% full`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={filled}
      className="h-2 overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn('h-full rounded-full', full ? 'bg-warning' : 'bg-success')}
        style={{ width: `${filled}%` }}
      />
    </div>
  )
}
