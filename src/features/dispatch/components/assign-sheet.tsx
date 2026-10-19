'use client'

import { HandHeart, Phone, SearchX, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { SkillBadges } from '@/components/shared/skill-chips'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { MAX_ACTIVE_TASKS, RATING_MAX } from '@/lib/constants'
import { formatDistance } from '@/lib/format'
import type { DispatchCandidate, ScoreParts, SosRequest } from '@/types'
import { useAssignSos, useCandidatesQuery } from '../dispatch.queries'

const PAGE_SIZE = 5
// Kilometres the search can be limited to. Leaving it out searches as wide as the "maximum radius" setting.
const RADIUS_OPTIONS_KM = [10, 25, 50, 100, 200] as const

const PART_LABEL: Record<keyof ScoreParts, string> = {
  distance: 'Distance (closer is better)',
  reliability: 'Reliability',
  load: 'Free capacity',
  skillMatch: 'Skills for this request',
  noShow: 'No-show penalty (lower is better)',
}

const percent = (value: number) => `${Math.round(value * 100)}%`

type Choice = { candidate: DispatchCandidate; direct: boolean }

function CandidateCard({
  candidate,
  onOffer,
  onAssign,
}: {
  candidate: DispatchCandidate
  onOffer: () => void
  onAssign: () => void
}) {
  const { volunteer } = candidate
  const rated = candidate.reliabilityScore > 0

  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm text-muted-foreground">Rank {candidate.rank}</p>
          <h3 className="text-base font-semibold text-balance">{volunteer.name}</h3>
          {volunteer.phone && (
            <a
              href={`tel:${volunteer.phone}`}
              className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Phone aria-hidden="true" className="size-4" />
              {volunteer.phone}
            </a>
          )}
        </div>
        <p className="shrink-0 rounded-lg bg-muted px-2.5 py-1.5 text-sm font-semibold tabular-nums">
          Score {Math.round(candidate.score * 100)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Distance</dt>
          <dd className="font-medium">about {formatDistance(candidate.distanceMeters)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Active tasks</dt>
          <dd className="font-medium">
            {candidate.activeTasks} of {MAX_ACTIVE_TASKS}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Rating</dt>
          <dd className="font-medium">
            {rated ? `${candidate.reliabilityScore.toFixed(1)} / ${RATING_MAX}` : 'Not rated yet'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">No-shows</dt>
          <dd className="font-medium">{candidate.noShowCount}</dd>
        </div>
      </dl>

      {candidate.matchedSkills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-success">Has the skills this request wants</p>
          <SkillBadges skills={candidate.matchedSkills} />
        </div>
      )}
      {candidate.skills.length > candidate.matchedSkills.length && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">Other skills</p>
          <SkillBadges
            skills={candidate.skills.filter((skill) => !candidate.matchedSkills.includes(skill))}
          />
        </div>
      )}
      {candidate.languages.length > 0 && (
        <p className="text-sm text-muted-foreground">Speaks {candidate.languages.join(', ')}</p>
      )}

      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer py-2.5 font-medium text-link outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          Why this rank
        </summary>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 pb-1">
          {(Object.keys(PART_LABEL) as (keyof ScoreParts)[]).map((part) => (
            <div key={part} className="contents">
              <dt className="text-muted-foreground">{PART_LABEL[part]}</dt>
              <dd className="text-right font-medium tabular-nums">
                {percent(candidate.scoreParts[part])}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button type="button" className="h-11 gap-2 px-4" onClick={onOffer}>
          <UserRoundPlus aria-hidden="true" />
          Offer
          <span className="sr-only"> this request to {volunteer.name}</span>
        </Button>
        <Button type="button" variant="outline" className="h-11 gap-2 px-4" onClick={onAssign}>
          <HandHeart aria-hidden="true" />
          Assign directly
          <span className="sr-only"> to {volunteer.name}</span>
        </Button>
      </div>
    </li>
  )
}

type AssignSheetProps = {
  sos: SosRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

// The volunteers the engine could pick for a request, best first, with why. An admin can offer the request
// (the volunteer may accept or decline) or assign it directly (it is theirs at once). Both touch real
// people, so both ask first and name the person and the request.
export function AssignSheet({ sos, open, onOpenChange }: AssignSheetProps) {
  const [radiusKm, setRadiusKm] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [choice, setChoice] = useState<Choice | null>(null)
  const assign = useAssignSos(sos.id)

  const query = useCandidatesQuery(sos.id, { radiusKm, page, limit: PAGE_SIZE }, open)
  const requestName = sos.address || `${sos.victim.name}'s request`

  function confirm() {
    if (!choice) return
    assign.mutate(
      {
        volunteerId: choice.candidate.volunteer.id,
        name: choice.candidate.volunteer.name,
        direct: choice.direct,
      },
      {
        onSuccess: () => {
          setChoice(null)
          onOpenChange(false)
        },
        onError: () => setChoice(null),
      },
    )
  }

  let body: React.ReactNode
  if (query.isError && !query.data) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.isPending) {
    body = (
      <div aria-busy="true" className="flex flex-col gap-3">
        <output className="sr-only">Loading volunteers</output>
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-56 rounded-2xl" />
        ))}
      </div>
    )
  } else if (query.data.items.length === 0) {
    body = (
      <EmptyState
        icon={SearchX}
        title="No volunteer is in reach"
        description="Nobody on duty with a saved location, free capacity and no earlier task on this request is within that distance. Try a wider search."
      />
    )
  } else {
    body = (
      <>
        <ul className="flex flex-col gap-3">
          {query.data.items.map((candidate) => (
            <CandidateCard
              key={candidate.volunteer.id}
              candidate={candidate}
              onOffer={() => setChoice({ candidate, direct: false })}
              onAssign={() => setChoice({ candidate, direct: true })}
            />
          ))}
        </ul>
        <PaginationBar meta={query.data.meta} onPageChange={setPage} disabled={query.isFetching} />
      </>
    )
  }

  const name = choice?.candidate.volunteer.name ?? ''

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // A click inside the confirm dialog is outside the sheet; it must not close the sheet under it.
        if (choice === null) onOpenChange(next)
      }}
    >
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>Choose a volunteer</SheetTitle>
          <SheetDescription>
            For {requestName}. These are the volunteers the automatic dispatch could pick, best
            first: on duty, with a saved location, free capacity, and no earlier task on this
            request.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <FilterChips
            label="Search within"
            allLabel="Widest"
            options={RADIUS_OPTIONS_KM.map((km) => ({ value: String(km), label: `${km} km` }))}
            value={radiusKm === undefined ? undefined : String(radiusKm)}
            onChange={(next) => {
              setRadiusKm(next === undefined ? undefined : Number(next))
              setPage(1)
            }}
          />
          {body}
        </div>
      </SheetContent>

      <ConfirmDialog
        open={choice !== null}
        onOpenChange={(next) => {
          if (!assign.isPending && !next) setChoice(null)
        }}
        title={choice?.direct ? `Assign directly to ${name}?` : `Offer this request to ${name}?`}
        description={
          choice?.direct ? (
            <>
              {name} gets {requestName} at once, without being asked, and {sos.victim.name} is told
              a volunteer is assigned. Any other offers for it are withdrawn. {name} must set off in
              time or it returns to the queue.
            </>
          ) : (
            <>
              {name} is notified and can accept or decline {requestName} within the normal offer
              time. Automatic dispatch waits while the offer is out.
            </>
          )
        }
        confirmLabel={choice?.direct ? 'Assign directly' : 'Send offer'}
        cancelLabel="Go back"
        tone="neutral"
        pending={assign.isPending}
        onConfirm={confirm}
      />
    </Sheet>
  )
}
