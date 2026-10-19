'use client'

import { ArrowRight, MapPinned, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ReliefBadges } from '@/components/shared/relief-category'
import { RequestedSkills } from '@/components/shared/skill-chips'
import { PriorityBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatDistance, formatRelativeTime } from '@/lib/format'
import { formatSkillList } from '@/lib/skills'
import { cn } from '@/lib/utils'
import type { NearbySos } from '@/types'
import { RequestActions } from './request-actions'

type NearbyCardProps = {
  sos: NearbySos
  selected: boolean
  onShowOnMap: () => void
}

// One request in a volunteer's list: how urgent, how far, what is needed, and the two things they can
// do. It shows only what the limited view carries: a first name, no phone and no street address.
export function NearbyCard({ sos, selected, onShowOnMap }: NearbyCardProps) {
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <PriorityBadge priority={sos.priority} className="w-fit" />
          <h3 className="text-base font-semibold text-balance">{sos.victim.name} needs help</h3>
          <p className="text-sm text-muted-foreground">
            Raised {formatRelativeTime(sos.createdAt)}
          </p>
        </div>
        <Badge variant="secondary" className="h-6 shrink-0 px-2.5">
          about {formatDistance(sos.distanceMeters)}
        </Badge>
      </div>

      <ReliefBadges categories={sos.needs} />
      <RequestedSkills skills={sos.requiredSkills} />
      {sos.skillMatch && (
        <p className="flex w-fit items-start gap-1.5 rounded-lg bg-success-soft px-2.5 py-1.5 text-sm font-medium text-success">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Matches your skills
            {sos.matchedSkills.length > 0 && (
              <span className="font-normal"> ({formatSkillList(sos.matchedSkills)})</span>
            )}
          </span>
        </p>
      )}
      {sos.description && (
        <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">{sos.description}</p>
      )}

      <RequestActions sosId={sos.id} />

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-2">
        <Link
          href={`/volunteer/nearby/${sos.id}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View details
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> of the request from {sos.victim.name}</span>
        </Link>
        <button
          type="button"
          onClick={onShowOnMap}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <MapPinned aria-hidden="true" className="size-4" />
          Show on map
        </button>
      </div>
    </li>
  )
}
