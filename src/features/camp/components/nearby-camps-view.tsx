'use client'

import { ArrowRight, ExternalLink, MapPinned, Tent } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { LocationStatus } from '@/components/shared/location-status'
import { MapControlBar } from '@/components/shared/map-control-bar'
import { PageHeader } from '@/components/shared/page-header'
import { PlacesMap } from '@/components/shared/places-map'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocationField } from '@/hooks/use-location-field'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { CAMP_RADIUS_OPTIONS_KM, DEFAULT_CAMP_RADIUS_KM } from '@/lib/constants'
import { formatDistance } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import { cn } from '@/lib/utils'
import type { NearbyCamp } from '@/types'
import { useNearbyCampsQuery } from '../camp.queries'
import { CAMP_MAP_LEGEND, campDirectionsUrl, isCampFull, toMapPlace } from '../camp.view'
import { OccupancyBar } from './occupancy-bar'

const MAP_ID = 'camps-map'

// Three decimals is about 100 m: a GPS fix that wobbles by a few metres does not ask the backend again.
const roundCoordinate = (value: number) => Math.round(value * 1000) / 1000

const campPath = (id: string) => `/dashboard/camps/${id}`

function CampCard({
  camp,
  selected,
  onShowOnMap,
}: {
  camp: NearbyCamp
  selected: boolean
  onShowOnMap: () => void
}) {
  const full = isCampFull(camp)

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-balance">{camp.name}</h3>
          {camp.ngo.name && <p className="text-sm text-muted-foreground">Run by {camp.ngo.name}</p>}
          {camp.address && <p className="text-sm text-muted-foreground">{camp.address}</p>}
        </div>
        <Badge variant="secondary" className="h-6 shrink-0 px-2.5">
          {formatDistance(camp.distanceMeters)}
        </Badge>
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

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1">
        <Link
          href={campPath(camp.id)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View details
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> of {camp.name}</span>
        </Link>
        <button
          type="button"
          onClick={onShowOnMap}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <MapPinned aria-hidden="true" className="size-4" />
          Show on map
        </button>
        <a
          href={campDirectionsUrl(camp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          Directions
          <span className="sr-only"> to {camp.name} (opens in a new tab)</span>
        </a>
      </div>
    </li>
  )
}

function CampList({
  camps,
  selectedId,
  onShowOnMap,
}: {
  camps: NearbyCamp[]
  selectedId: string | null
  onShowOnMap: (id: string) => void
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {camps.map((camp) => (
        <CampCard
          key={camp.id}
          camp={camp}
          selected={camp.id === selectedId}
          onShowOnMap={() => onShowOnMap(camp.id)}
        />
      ))}
    </ul>
  )
}

// Relief camps near the victim, on one big map. The position comes from GPS, or a tap on the map, or the
// location saved on the profile, in that order of preference. The bar above the map holds the radius
// (kept in the URL), a refresh button and the counts; hovering a camp shows its details and clicking
// it opens the camp's own page. A map is never the only way: every camp is also in the list below.
export function NearbyCampsView() {
  const session = useSession()
  const router = useRouter()
  const params = useQueryParams()
  const location = useLocationField()
  const reduceMotion = usePrefersReducedMotion()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const radiusKm =
    CAMP_RADIUS_OPTIONS_KM.find((km) => String(km) === params.get('radius')) ??
    DEFAULT_CAMP_RADIUS_KM

  const profilePosition = session.location ? fromGeoPoint(session.location) : null
  const origin = location.position ?? profilePosition
  const usingProfile = !location.position && profilePosition !== null

  const query = useNearbyCampsQuery(
    origin
      ? {
          lng: roundCoordinate(origin.lng),
          lat: roundCoordinate(origin.lat),
          radius: radiusKm * 1000,
          limit: 50,
        }
      : null,
  )
  const camps = query.data?.items ?? []
  const fullCount = camps.filter(isCampFull).length

  // From the list: pick the camp and bring the map into view so the user sees where it is.
  function showOnMap(id: string) {
    setSelectedId(id)
    document
      .getElementById(MAP_ID)
      ?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  let list: React.ReactNode
  if (!origin) {
    list = (
      <EmptyState
        icon={MapPinned}
        title="Where are you?"
        description="Allow location access, or tap the map where you are, and we will list the camps around you."
      />
    )
  } else if (query.isError) {
    list = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.isPending) {
    list = (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-44 rounded-2xl" />
        ))}
      </div>
    )
  } else if (camps.length === 0) {
    list = (
      <EmptyState
        icon={Tent}
        title={`No open camps within ${radiusKm} km`}
        description="Try a wider radius. If you are in danger now, raise an SOS instead."
      />
    )
  } else {
    list = <CampList camps={camps} selectedId={selectedId} onShowOnMap={showOnMap} />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relief camps near you"
        description="Open camps around your position, with the places they have left. Hover a camp for its details, click it to open its page."
      />

      <div className="flex flex-col gap-3">
        <LocationStatus
          status={location.status}
          source={location.source}
          position={location.position}
          accuracyMeters={location.accuracyMeters}
          message={location.message}
          onLocate={location.locate}
        />
        {usingProfile && (
          <p className="text-sm text-muted-foreground">
            Using the location saved on your profile. Allow location access or tap the map to use
            where you are now.
          </p>
        )}
      </div>

      <section id={MAP_ID} aria-label="Map of relief camps" className="scroll-mt-24">
        <PlacesMap
          className="h-[34rem] lg:h-[calc(100dvh-9rem)] lg:min-h-[36rem]"
          header={
            <MapControlBar
              radius={{
                valueKm: radiusKm,
                options: CAMP_RADIUS_OPTIONS_KM,
                onChange: (km) => params.set({ radius: String(km) }),
              }}
              onRefresh={() => query.refetch()}
              refreshDisabled={!origin || query.isFetching}
              refreshing={query.isFetching}
              updatedAt={query.dataUpdatedAt}
              error={query.isError ? 'Could not load the camps.' : null}
              chips={[
                { label: `${camps.length} TOTAL`, tone: 'blue' },
                ...(fullCount > 0 ? [{ label: `${fullCount} FULL`, tone: 'amber' as const }] : []),
              ]}
            />
          }
          you={origin}
          places={camps.map(toMapPlace)}
          legend={CAMP_MAP_LEGEND}
          radiusMeters={origin ? radiusKm * 1000 : null}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpen={(id) => router.push(campPath(id))}
          onPickYou={location.setPin}
          onLocate={location.locate}
          locating={location.status === 'locating'}
          emptyNote={
            origin && !query.isPending && camps.length === 0 ? (
              <>
                <p className="font-semibold">No open camps</p>
                <p className="text-sm">within {radiusKm} km of you</p>
              </>
            ) : null
          }
        />
      </section>

      <section aria-labelledby="camp-list-heading" className="flex flex-col gap-3">
        <h2 id="camp-list-heading" className="text-lg">
          Camps in range
        </h2>
        {list}
      </section>
    </div>
  )
}
