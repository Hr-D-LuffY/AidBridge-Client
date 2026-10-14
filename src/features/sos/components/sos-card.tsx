'use client'

import { ArrowRight, ChevronDown, Phone, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type SosRequest, SosStatus } from '@/types'
import { STATUS_SURFACE } from '../sos.surface'
import { SosProgress } from './sos-progress'

// One request in "My requests". It starts minimized to a single row (status, priority, address, when it
// was raised) so a long list stays short; the arrow opens it to show what was asked for, the steps,
// the volunteer and the button to track it.
export function SosCard({ sos }: { sos: SosRequest }) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const finished = sos.status === SosStatus.RESCUED || sos.status === SosStatus.CLOSED
  const title = sos.address || 'Request without an address'

  return (
    <article className={cn('overflow-hidden rounded-2xl border', STATUS_SURFACE[sos.status])}>
      <h2 className="text-base">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full cursor-pointer items-center gap-3 p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 sm:px-5"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="flex flex-wrap gap-2">
              <StatusBadge kind="sos" status={sos.status} />
              <PriorityBadge priority={sos.priority} />
            </span>
            <span className="truncate text-lg font-semibold">{title}</span>
            <span className="text-sm font-normal text-muted-foreground">
              Raised {formatRelativeTime(sos.createdAt)}
              {sos.assignedVolunteer && <> · {sos.assignedVolunteer.name}</>}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-card/70 ring-1 ring-border"
          >
            <ChevronDown className={cn('size-5 transition-transform', open && 'rotate-180')} />
          </span>
          <span className="sr-only">{open ? 'Hide details' : 'Show details'}</span>
        </button>
      </h2>

      {open && (
        <div id={detailsId} className="flex flex-col gap-4 border-t border-border/60 p-4 sm:p-5">
          <ReliefBadges categories={sos.needs} />
          {sos.description && (
            <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
              {sos.description}
            </p>
          )}

          <SosProgress status={sos.status} />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            {sos.assignedVolunteer ? (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
                  {sos.assignedVolunteer.name}
                </span>
                <a
                  href={`tel:${sos.assignedVolunteer.phone}`}
                  className="flex min-h-11 items-center gap-1.5 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  {sos.assignedVolunteer.phone}
                </a>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {finished
                  ? 'No volunteer took this request.'
                  : 'Waiting for a volunteer to accept.'}
              </p>
            )}
            <Link
              href={`/dashboard/sos/${sos.id}`}
              className={cn(
                buttonVariants({ variant: finished ? 'outline' : 'default' }),
                'h-11 gap-2 px-5',
              )}
            >
              {finished ? 'View' : 'Track request'}
              <ArrowRight aria-hidden="true" />
              <span className="sr-only"> {sos.address || 'request'}</span>
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
