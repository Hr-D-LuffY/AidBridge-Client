'use client'

import { ArrowRight, MapPinned, Siren, Tent } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { MapControlBar } from '@/components/shared/map-control-bar'
import { PageHeader } from '@/components/shared/page-header'
import { PlacesMap } from '@/components/shared/places-map'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { OccupancyBar } from '@/features/camp/components/occupancy-bar'
import { SosDetailSheet } from '@/features/sos/components/sos-detail-sheet'
import { usePolling } from '@/hooks/use-polling'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type LiveMapCamp, type LiveMapRequest, Priority } from '@/types'
import { useLiveMapQuery } from '../analytics.queries'
import {
  isLiveCampFull,
  LIVE_MAP_LEGEND,
  toLiveCampPlace,
  toLiveRequestPlace,
} from '../analytics.view'

const MAP_ID = 'live-map'

const SHOW_ON_MAP =
  'inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'

function RequestCard({
  request,
  selected,
  onShowOnMap,
  onOpen,
}: {
  request: LiveMapRequest
  selected: boolean
  onShowOnMap: () => void
  onOpen: () => void
}) {
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={request.priority} />
        <StatusBadge kind="sos" status={request.status} />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-balance">{request.victim.name}</h3>
        {request.address && <p className="text-sm text-muted-foreground">{request.address}</p>}
      </div>
      <ReliefBadges categories={request.needs} />
      <p className="text-sm text-muted-foreground">
        {request.assignedVolunteer
          ? `Volunteer: ${request.assignedVolunteer.name}`
          : 'No volunteer yet'}{' '}
        · raised {formatRelativeTime(request.createdAt)}
      </p>
      <div className="mt-auto flex flex-wrap gap-x-4">
        <button type="button" onClick={onOpen} className={cn(SHOW_ON_MAP, 'font-semibold')}>
          View details
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> of the request from {request.victim.name}</span>
        </button>
        <button type="button" onClick={onShowOnMap} className={SHOW_ON_MAP}>
          <MapPinned aria-hidden="true" className="size-4" />
          Show on map
          <span className="sr-only"> the request from {request.victim.name}</span>
        </button>
      </div>
    </li>
  )
}

function CampCard({
  camp,
  selected,
  onShowOnMap,
}: {
  camp: LiveMapCamp
  selected: boolean
  onShowOnMap: () => void
}) {
  const full = isLiveCampFull(camp)
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-balance">{camp.name}</h3>
        <p className="text-sm text-muted-foreground">Run by {camp.ngo.name}</p>
        {camp.address && <p className="text-sm text-muted-foreground">{camp.address}</p>}
      </div>
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
      <button type="button" onClick={onShowOnMap} className={cn(SHOW_ON_MAP, 'mt-auto w-fit')}>
        <MapPinned aria-hidden="true" className="size-4" />
        Show on map
        <span className="sr-only"> {camp.name}</span>
      </button>
    </li>
  )
}

function ListSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <output className="sr-only">Loading</output>
      {['one', 'two', 'three'].map((id) => (
        <Skeleton key={id} className="h-44 rounded-2xl" />
      ))}
    </div>
  )
}

// What is happening right now, on one map: open relief camps (green, amber when full) and open requests
// (a triangle coloured by priority). Asked again every 30 seconds. A map is never the only way, so every
// request and camp is also listed below it; "Show on map" centres the map on one. Clicking a request on
// the map, or "View details" on its card, opens the whole request in a panel (the live map's own data has
// no phone numbers, the request's full view does).
export function LiveMapView() {
  const poll = usePolling(POLL_INTERVAL_MS.liveMap)
  const query = useLiveMapQuery(poll)
  const reduceMotion = usePrefersReducedMotion()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // The request whose details are open in the side panel.
  const [openId, setOpenId] = useState<string | null>(null)

  const requests = query.data?.requests ?? []
  const camps = query.data?.camps ?? []
  const critical = requests.filter((request) => request.priority === Priority.CRITICAL).length
  const full = camps.filter(isLiveCampFull).length
  const empty = query.data !== undefined && requests.length === 0 && camps.length === 0

  function openRequest(id: string) {
    setSelectedId(id)
    setOpenId(id)
  }

  // From a list: pick the place and bring the map into view so the user sees where it is.
  function showOnMap(id: string) {
    setSelectedId(id)
    document
      .getElementById(MAP_ID)
      ?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  let requestList: React.ReactNode
  let campList: React.ReactNode
  if (query.isPending) {
    requestList = <ListSkeleton />
    campList = <ListSkeleton />
  } else if (query.isError && !query.data) {
    requestList = <ListErrorState onRetry={() => query.refetch()} />
    campList = null
  } else {
    requestList =
      requests.length === 0 ? (
        <EmptyState
          icon={Siren}
          title="No open requests"
          description="Every request is rescued or closed right now. New ones appear here as they come in."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              selected={request.id === selectedId}
              onShowOnMap={() => showOnMap(request.id)}
              onOpen={() => openRequest(request.id)}
            />
          ))}
        </ul>
      )
    campList =
      camps.length === 0 ? (
        <EmptyState
          icon={Tent}
          title="No open camps"
          description="No relief camp is open at the moment."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {camps.map((camp) => (
            <CampCard
              key={camp.id}
              camp={camp}
              selected={camp.id === selectedId}
              onShowOnMap={() => showOnMap(camp.id)}
            />
          ))}
        </ul>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Live map"
        description="Open relief camps and requests for help, right now. Hover a pin for a summary and click a request for all its details. The map refreshes by itself every 30 seconds."
      />

      <section
        id={MAP_ID}
        aria-label="Live map of camps and open requests"
        className="scroll-mt-24"
      >
        <PlacesMap
          className="h-[34rem] lg:h-[calc(100dvh-9rem)] lg:min-h-[36rem]"
          header={
            <MapControlBar
              onRefresh={() => query.refetch()}
              refreshDisabled={query.isFetching}
              refreshing={query.isFetching}
              updatedAt={query.dataUpdatedAt}
              error={query.isError ? 'Could not refresh the map.' : null}
              chips={[
                { label: `${camps.length} CAMPS`, tone: 'green' },
                ...(full > 0 ? [{ label: `${full} FULL`, tone: 'amber' as const }] : []),
                { label: `${requests.length} OPEN`, tone: 'blue' },
                ...(critical > 0 ? [{ label: `${critical} CRITICAL`, tone: 'red' as const }] : []),
              ]}
            />
          }
          you={null}
          places={[...camps.map(toLiveCampPlace), ...requests.map(toLiveRequestPlace)]}
          legend={LIVE_MAP_LEGEND}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpen={openRequest}
          emptyNote={
            empty ? (
              <>
                <p className="font-semibold">Nothing open</p>
                <p className="text-sm">no camps and no requests right now</p>
              </>
            ) : null
          }
        />
      </section>

      <section aria-labelledby="live-requests-heading" className="flex flex-col gap-3">
        <h2 id="live-requests-heading" className="text-lg">
          Open requests
        </h2>
        {requestList}
      </section>

      {campList && (
        <section aria-labelledby="live-camps-heading" className="flex flex-col gap-3">
          <h2 id="live-camps-heading" className="text-lg">
            Open camps
          </h2>
          {campList}
        </section>
      )}

      {openId && (
        <SosDetailSheet
          key={openId}
          id={openId}
          open
          onOpenChange={(open) => {
            if (!open) setOpenId(null)
          }}
        />
      )}
    </div>
  )
}
