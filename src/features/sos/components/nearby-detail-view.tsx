'use client'

import { Lock, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LocationMap } from '@/components/shared/location-map'
import { PageHeader } from '@/components/shared/page-header'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import type { LimitedSos } from '@/types'
import { RequestActions } from './request-actions'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

// A request that is still waiting, as a volunteer who has not taken it sees it: what is needed, how
// urgent, and the area (about 1 km) it is in. The phone number, the street address, the photos and the
// exact spot come with accepting.
export function NearbyDetailView({ sos }: { sos: LimitedSos }) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/volunteer/nearby', label: 'Requests near you' }}
        title={`${sos.victim.name} needs help`}
        description={`Raised ${formatRelativeTime(sos.createdAt)}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="sos" status={sos.status} />
        <PriorityBadge priority={sos.priority} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <Panel title="What they need">
            <ReliefBadges categories={sos.needs} />
            {sos.description ? (
              <p className="text-pretty whitespace-pre-line">{sos.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No extra details were given.</p>
            )}
            <p className="text-sm text-muted-foreground">
              Raised on {formatDateTime(sos.createdAt)}.
            </p>
          </Panel>

          <Panel title="The area">
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              The map shows the area they are in, rounded to about 1 km on purpose. The exact spot
              is shared when you accept.
            </p>
            <LocationMap
              className="h-72 w-full"
              position={fromGeoPoint(sos.approximateLocation)}
              readOnly
            />
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Help this person">
            <RequestActions sosId={sos.id} onDeclined={() => router.push('/volunteer/nearby')} />
            <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              When you accept, you get their phone number, address, photos and exact location, and a
              chat opens. You can back out until you set off.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
