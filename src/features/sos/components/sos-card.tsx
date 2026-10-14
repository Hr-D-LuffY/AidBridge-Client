import { ArrowRight, Phone, UserRound } from 'lucide-react'
import Link from 'next/link'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type SosRequest, SosStatus } from '@/types'
import { SosProgress } from './sos-progress'

// One request in "My requests": its status, what was asked for, the four steps, the volunteer, and one
// clear button. Plain markup with no hooks.
export function SosCard({ sos }: { sos: SosRequest }) {
  const finished = sos.status === SosStatus.RESCUED || sos.status === SosStatus.CLOSED

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="sos" status={sos.status} />
            <PriorityBadge priority={sos.priority} />
          </div>
          <h2 className="text-lg text-balance">{sos.address || 'Request without an address'}</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          Raised {formatRelativeTime(sos.createdAt)}
        </span>
      </div>

      <ReliefBadges categories={sos.needs} />
      {sos.description && (
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{sos.description}</p>
      )}

      <SosProgress status={sos.status} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
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
            {finished ? 'No volunteer took this request.' : 'Waiting for a volunteer to accept.'}
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
    </article>
  )
}
