'use client'

import { ArrowRight, BellRing, EyeOff, HandHeart, Timer } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReliefBadges } from '@/components/shared/relief-category'
import { RequestedSkills } from '@/components/shared/skill-chips'
import { PriorityBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { useAcceptBlock } from '@/features/sos/components/request-actions'
import { useNow } from '@/hooks/use-now'
import { usePolling } from '@/hooks/use-polling'
import { useSession } from '@/hooks/use-session'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { formatDistance } from '@/lib/format'
import { distanceBetween, fromGeoPoint } from '@/lib/geo'
import { cn } from '@/lib/utils'
import { isFullSos, OfferSource } from '@/types'
import {
  formatCountdown,
  getOfferRemainingMs,
  OFFER_URGENT_MS,
  type OfferTask,
} from '../task.offer'
import { useOffersQuery, useRespondToOffer } from '../task.queries'

const SOURCE_TEXT: Record<OfferSource, string> = {
  [OfferSource.AUTO]: 'Matched to you because you are close and on duty.',
  [OfferSource.ADMIN]: 'Sent to you by an administrator.',
  [OfferSource.NGO]: 'Sent to you by an NGO.',
}

type OfferCardProps = {
  task: OfferTask
  remainingMs: number
}

// One offer: who needs help, what, how far, how long is left, and the two answers. The request is the
// limited view (a first name and a rounded position), the same as on the map. Once the time is up the
// answers go away: the request may still be open on the map, so the card links to it instead.
function OfferCard({ task, remainingMs }: OfferCardProps) {
  const router = useRouter()
  const session = useSession()
  const respond = useRespondToOffer()
  const block = useAcceptBlock()
  const [declining, setDeclining] = useState(false)

  const { sosRequest: sos, offer } = task
  const expired = remainingMs <= 0
  const urgent = !expired && remainingMs <= OFFER_URGENT_MS
  const place = isFullSos(sos) ? sos.location : sos.approximateLocation
  const distance = session.location
    ? distanceBetween(fromGeoPoint(session.location), fromGeoPoint(place))
    : null

  function accept() {
    respond.mutate(
      { taskId: task.id, action: 'accept' },
      { onSuccess: (accepted) => router.push(`/volunteer/tasks/${accepted.id}`) },
    )
  }

  function decline() {
    respond.mutate(
      { taskId: task.id, action: 'reject' },
      { onSuccess: () => setDeclining(false), onError: () => setDeclining(false) },
    )
  }

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-4',
        expired ? 'border-border' : 'border-high/50',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <PriorityBadge priority={sos.priority} className="w-fit" />
          <h3 className="text-base font-semibold text-balance">{sos.victim.name} needs help</h3>
          {offer.source && (
            <p className="text-sm text-muted-foreground">{SOURCE_TEXT[offer.source]}</p>
          )}
        </div>
        <p
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums',
            expired && 'bg-muted text-muted-foreground',
            urgent && 'bg-destructive-soft text-destructive',
            !expired && !urgent && 'bg-high-soft text-high',
          )}
        >
          <Timer aria-hidden="true" className="size-4" />
          {expired ? 'Time is up' : `Respond within ${formatCountdown(remainingMs)}`}
        </p>
      </div>

      <ReliefBadges categories={sos.needs} />
      <RequestedSkills skills={sos.requiredSkills} />
      {sos.description && (
        <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">{sos.description}</p>
      )}
      {distance !== null && (
        <p className="text-sm text-muted-foreground">
          About {formatDistance(distance)} from your saved location, in a straight line.
        </p>
      )}

      {expired ? (
        <div className="flex flex-col gap-2 rounded-xl bg-muted p-3 text-sm">
          <p>
            This offer ran out of time. If the request is still open you can take it from your map.
          </p>
          <Link
            href={`/volunteer/nearby/${sos.id}`}
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            View the request
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-11 gap-2 px-5"
              disabled={respond.isPending || block !== null}
              onClick={accept}
            >
              <HandHeart aria-hidden="true" />
              {respond.isPending && respond.variables?.action === 'accept'
                ? 'Accepting…'
                : 'Accept offer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 px-4"
              disabled={respond.isPending}
              onClick={() => setDeclining(true)}
            >
              <EyeOff aria-hidden="true" />
              Decline
            </Button>
            <Link
              href={`/volunteer/nearby/${sos.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              View details
              <span className="sr-only"> of the request from {sos.victim.name}</span>
            </Link>
          </div>
          {block && <p className="text-sm text-muted-foreground">{block}</p>}
        </>
      )}

      <ConfirmDialog
        open={declining}
        onOpenChange={(next) => {
          if (!respond.isPending) setDeclining(next)
        }}
        title="Decline this offer?"
        description={`It disappears from your list and you will not see ${sos.victim.name}'s request again. Other volunteers can still take it.`}
        confirmLabel="Decline offer"
        cancelLabel="Keep it"
        pending={respond.isPending}
        onConfirm={decline}
      />
    </li>
  )
}

// "Offers for you": requests the dispatch engine (or an admin or NGO) asked this volunteer to take, each
// with a live countdown on the server's clock. Nothing is shown when there are none. A polite live region
// announces a new offer to a screen reader without announcing every tick of the clock.
export function OffersPanel() {
  const poll = usePolling(POLL_INTERVAL_MS.offers)
  const { data } = useOffersQuery(poll)
  const offers = [...(data?.offers ?? [])].sort((a, b) =>
    a.offer.expiresAt.localeCompare(b.offer.expiresAt),
  )
  const now = useNow(1000, offers.length > 0)
  const offsetMs = data?.clockOffsetMs ?? 0
  const open = offers.filter((task) => getOfferRemainingMs(task.offer, now, offsetMs) > 0).length

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {open > 0
          ? `${open} ${open === 1 ? 'offer is' : 'offers are'} waiting for your answer.`
          : ''}
      </p>
      {offers.length > 0 && (
        <section
          id="offers"
          aria-labelledby="offers-heading"
          className="flex scroll-mt-24 flex-col gap-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <BellRing aria-hidden="true" className="size-5 text-high" />
            <h2 id="offers-heading" className="text-lg">
              Offers for you
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You were picked for these requests. The first volunteer to accept gets the request, so
            answer soon. Declining hides it from you for good.
          </p>
          <ul className="grid gap-3 lg:grid-cols-2">
            {offers.map((task) => (
              <OfferCard
                key={task.id}
                task={task}
                remainingMs={getOfferRemainingMs(task.offer, now, offsetMs)}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
