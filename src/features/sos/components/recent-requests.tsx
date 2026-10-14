import { ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { formatRelativeTime } from '@/lib/format'
import type { SosRequest } from '@/types'

// The latest requests on the overview. Plain markup with no hooks, so the server page renders it.
export function RecentRequests({ requests }: { requests: SosRequest[] }) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No requests yet"
        description="When you raise an SOS it shows up here, and you can follow it until help arrives."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((sos) => (
        <li key={sos.id}>
          <Link
            href={`/dashboard/sos/${sos.id}`}
            className="flex flex-col gap-2 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{sos.address || 'Request without an address'}</span>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(sos.createdAt)}
              </span>
            </div>
            <ReliefBadges categories={sos.needs} />
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="sos" status={sos.status} />
              <PriorityBadge priority={sos.priority} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
