'use client'

import { CircleArrowUp, Radar, TriangleAlert } from 'lucide-react'
import { usePolling } from '@/hooks/use-polling'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { type SosRequest, SosStatus } from '@/types'
import { useSosTimelineQuery } from '../sos.queries'
import { getSearchState } from '../sos.timeline'

// While nobody has taken the request: that we are looking, how far we have looked, and whether it was
// escalated. The victim is never sent the staff `dispatch` block, so all of this is read from the
// timeline. Nothing is shown once a volunteer is on the request.
export function RequestSearchCard({ sos }: { sos: SosRequest }) {
  const searching = sos.status === SosStatus.PENDING
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus, searching)
  const query = useSosTimelineQuery(sos.id, poll)

  if (!searching) return null

  const state = query.data ? getSearchState(query.data.items) : null

  return (
    <section
      aria-labelledby="search-heading"
      className="flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Radar aria-hidden="true" className="size-5 text-warning" />
        <h2 id="search-heading" className="text-base font-semibold">
          Looking for a volunteer
        </h2>
      </div>
      <p className="text-sm text-pretty">
        Volunteers near you can see your request. You will see it here, and get a notification, as
        soon as someone accepts.
      </p>

      {state?.widened && (
        <p className="flex items-start gap-2 text-sm font-medium">
          <Radar aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          No one nearby has taken it yet, so we widened the search to reach volunteers further away.
        </p>
      )}
      {state?.raised && (
        <p className="flex items-start gap-2 text-sm font-medium">
          <CircleArrowUp aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Escalated: your request was marked more urgent so that it is seen sooner.
        </p>
      )}
      {state?.unserved && (
        <p className="flex items-start gap-2 text-sm font-medium">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          No volunteer has accepted yet. Our team has been told and we keep trying. If you are in
          immediate danger, call your local emergency number.
        </p>
      )}
    </section>
  )
}
