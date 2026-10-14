'use client'

import { ExternalLink, PackageOpen, Radar, Tent, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { getReliefLabel } from '@/components/shared/relief-category'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HandOutSheet } from '@/features/distribution/components/hand-out-sheet'
import { useActiveTasksQuery } from '@/features/task/task.queries'
import { usePolling } from '@/hooks/use-polling'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { AssignedCamp, StockItem } from '@/types'
import { MY_CAMPS_PARAMS } from '../camp.params'
import { useMyCampsQuery } from '../camp.queries'
import { campDirectionsUrl, isCampFull } from '../camp.view'
import { OccupancyBar } from './occupancy-bar'

type HandOutTarget = { campId: string; inventoryItemId: string }

function StockRow({
  item,
  canHandOut,
  onHandOut,
}: {
  item: StockItem
  canHandOut: boolean
  onHandOut: () => void
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {item.itemName}
          {item.isLow && (
            <Badge variant="secondary" className="h-6 bg-warning-soft px-2.5 text-warning">
              <TriangleAlert aria-hidden="true" />
              Running low
            </Badge>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {getReliefLabel(item.category)} ·{' '}
          <span className="font-semibold text-foreground tabular-nums">{item.quantity}</span>{' '}
          {item.unit} in stock
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 px-3"
        disabled={!canHandOut}
        onClick={onHandOut}
      >
        <PackageOpen aria-hidden="true" />
        Hand out
        <span className="sr-only"> {item.itemName}</span>
      </Button>
    </li>
  )
}

function CampCard({
  camp,
  canHandOut,
  onHandOut,
}: {
  camp: AssignedCamp
  canHandOut: boolean
  onHandOut: (target: HandOutTarget) => void
}) {
  const full = isCampFull(camp)

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-balance">{camp.name}</h3>
          {camp.address && <p className="text-sm text-muted-foreground">{camp.address}</p>}
        </div>
        <a
          href={campDirectionsUrl(camp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          Directions
          <span className="sr-only"> to {camp.name} (opens in a new tab)</span>
        </a>
      </header>

      <div className="flex flex-col gap-1.5">
        <OccupancyBar camp={camp} />
        <p className="text-sm">
          {full ? (
            <span className="font-semibold text-warning">Full right now</span>
          ) : (
            <span>
              <span className="font-semibold tabular-nums">{camp.availableSpots}</span> places free
              of <span className="tabular-nums">{camp.capacity}</span>
            </span>
          )}
        </p>
      </div>

      <section aria-label={`Stock at ${camp.name}`} className="flex flex-col">
        <h4 className="text-sm font-semibold">Stock you can hand out</h4>
        {camp.inventory.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            Nothing is in stock here right now. The NGO that runs this camp adds stock.
          </p>
        ) : (
          <ul className="divide-y">
            {camp.inventory.map((item) => (
              <StockRow
                key={item.id}
                item={item}
                canHandOut={canHandOut}
                onHandOut={() => onHandOut({ campId: camp.id, inventoryItemId: item.id })}
              />
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}

// The camps an NGO has assigned the volunteer to, with what is in stock at each (items with nothing
// left are not listed). Aid is handed out to the person the volunteer is helping, so "Hand out" needs
// a task that is being worked; without one it is off and the page says why. Stock is read again every
// 30 seconds, because other volunteers hand out from the same camps.
export function MyCampsView() {
  const poll = usePolling(POLL_INTERVAL_MS.nearby)
  const camps = useMyCampsQuery(MY_CAMPS_PARAMS, { pollMs: poll })
  const active = useActiveTasksQuery()
  const [target, setTarget] = useState<HandOutTarget | null>(null)

  const tasks = active.data ?? []
  const canHandOut = tasks.length > 0

  let body: React.ReactNode
  if (camps.isPending) {
    body = (
      <div aria-busy="true" className="grid gap-4 lg:grid-cols-2">
        <output className="sr-only">Loading your camps</output>
        {['one', 'two'].map((id) => (
          <Skeleton key={id} className="h-72 rounded-2xl" />
        ))}
      </div>
    )
  } else if (camps.isError && !camps.data) {
    body = <ListErrorState onRetry={() => camps.refetch()} />
  } else if (camps.data?.items.length === 0) {
    body = (
      <EmptyState
        icon={Tent}
        title="You are not assigned to a camp yet"
        description="An NGO assigns volunteers to its relief camps. Once you are assigned, the camp and its stock appear here."
      />
    )
  } else {
    body = (
      <ul aria-label="Your camps" className="grid gap-4 lg:grid-cols-2">
        {camps.data?.items.map((camp) => (
          <li key={camp.id}>
            <CampCard camp={camp} canHandOut={canHandOut} onHandOut={setTarget} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relief camps"
        description="The camps you are assigned to and what each has in stock. Hand out aid to the people you are helping."
      />

      {camps.data && camps.data.items.length > 0 && !canHandOut && !active.isPending && (
        <div className="flex flex-col gap-3 rounded-xl border bg-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <Radar aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            Aid goes to the person you are helping, so accept a request before you hand anything
            out.
          </p>
          <Link
            href="/volunteer/nearby"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 shrink-0 px-4')}
          >
            Find requests
          </Link>
        </div>
      )}

      {body}

      {target && (
        <HandOutSheet
          open
          onOpenChange={(open) => {
            if (!open) setTarget(null)
          }}
          tasks={tasks}
          campId={target.campId}
          inventoryItemId={target.inventoryItemId}
        />
      )}
    </div>
  )
}
