'use client'

import { Phone, UserRound } from 'lucide-react'
import { ListErrorState } from '@/components/shared/list-error-state'
import { LocationMap } from '@/components/shared/location-map'
import { ReliefBadges } from '@/components/shared/relief-category'
import { RequestedSkills } from '@/components/shared/skill-chips'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { usePolling } from '@/hooks/use-polling'
import { isApiError } from '@/lib/api/errors'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import type { SosPerson, SosRequest } from '@/types'
import { useSosQuery } from '../sos.queries'
import { SosMedia } from './sos-media'
import { SosProgress } from './sos-progress'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Person({ person }: { person: SosPerson }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 font-medium">
        <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
        {person.name}
      </p>
      <a
        href={`tel:${person.phone}`}
        className="flex min-h-11 w-fit items-center gap-2 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Phone aria-hidden="true" className="size-4" />
        {person.phone}
      </a>
    </div>
  )
}

function Details({ sos }: { sos: SosRequest }) {
  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="sos" status={sos.status} />
        <PriorityBadge priority={sos.priority} />
      </div>

      <SosProgress status={sos.status} />

      <Section title="What was asked for">
        <ReliefBadges categories={sos.needs} />
        <RequestedSkills skills={sos.requiredSkills} />
        {sos.description ? (
          <p className="text-pretty whitespace-pre-line">{sos.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No extra details.</p>
        )}
      </Section>

      {sos.media.length > 0 && (
        <Section title="Photos and videos">
          <SosMedia media={sos.media} />
        </Section>
      )}

      <Section title="Victim">
        <Person person={sos.victim} />
      </Section>

      <Section title="Volunteer">
        {sos.assignedVolunteer ? (
          <Person person={sos.assignedVolunteer} />
        ) : (
          <p className="text-sm text-muted-foreground">No volunteer has taken this yet.</p>
        )}
      </Section>

      <Section title="Where">
        {sos.address && <p>{sos.address}</p>}
        <LocationMap
          className="h-56 w-full"
          position={fromGeoPoint(sos.location)}
          readOnly
          scrollZoom
        />
      </Section>

      {sos.resolvedAt && (
        <Section title="How it ended">
          <p className="text-sm">Ended on {formatDateTime(sos.resolvedAt)}.</p>
          {sos.resolveReason && (
            <p className="rounded-xl bg-muted p-3 text-sm">
              <span className="text-muted-foreground">Reason: </span>
              {sos.resolveReason}
            </p>
          )}
        </Section>
      )}
    </div>
  )
}

type SosDetailSheetProps = {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// One request, read only, in a panel beside whatever the user was looking at (a map, a list). It reads the
// request when it opens and asks again every 15 seconds, so its status keeps up. It is the full view,
// which the backend gives to admins and NGOs. Mount it only while it is open, so it starts fresh.
export function SosDetailSheet({ id, open, onOpenChange }: SosDetailSheetProps) {
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus)
  const query = useSosQuery(id, poll)
  const sos = query.data

  let body: React.ReactNode
  if (sos) {
    body = <Details sos={sos} />
  } else if (query.isError) {
    const gone = isApiError(query.error) && [400, 403, 404].includes(query.error.status)
    body = gone ? (
      <p className="p-4 text-sm text-muted-foreground">This request could not be found.</p>
    ) : (
      <ListErrorState onRetry={() => query.refetch()} />
    )
  } else {
    body = (
      <div aria-busy="true" className="flex flex-col gap-4 p-4">
        <output className="sr-only">Loading the request</output>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="text-balance">
            {sos ? sos.address || `Request from ${sos.victim.name}` : 'Request details'}
          </SheetTitle>
          <SheetDescription>
            {sos ? `Raised ${formatRelativeTime(sos.createdAt)}` : 'Loading the request.'}
          </SheetDescription>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  )
}
