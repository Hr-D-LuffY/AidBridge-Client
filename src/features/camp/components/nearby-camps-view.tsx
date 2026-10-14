'use client'

import { ExternalLink, MapPinned, Tent } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { ListErrorState } from '@/components/shared/list-error-state'
import { LocationStatus } from '@/components/shared/location-status'
import { PageHeader } from '@/components/shared/page-header'
import { PlacesMap } from '@/components/shared/places-map'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocationField } from '@/hooks/use-location-field'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { CAMP_RADIUS_OPTIONS_KM, DEFAULT_CAMP_RADIUS_KM } from '@/lib/constants'
import { formatDistance } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import { cn } from '@/lib/utils'
import type { NearbyCamp } from '@/types'
import { useNearbyCampsQuery } from '../camp.queries'

const RADIUS_CHOICES = CAMP_RADIUS_OPTIONS_KM.map((km) => ({
  value: String(km),
  label: `${km} km`,
}))

// Three decimals is about 100 m: a GPS fix that wobbles by a few metres does not ask the backend again.
const roundCoordinate = (value: number) => Math.round(value * 1000) / 1000

function directionsUrl({ location }: NearbyCamp) {
  const [lng, lat] = location.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

function CampCard({
  camp,
  selected,
  onSelect,
}: {
  camp: NearbyCamp
  selected: boolean
  onSelect: () => void
}) {
  const full = camp.availableSpots <= 0
  const filled = Math.min(100, Math.round((camp.currentOccupancy / camp.capacity) * 100))

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
          {camp.address && <p className="text-sm text-muted-foreground">{camp.address}</p>}
        </div>
        <Badge variant="secondary" className="h-6 shrink-0 px-2.5">
          {formatDistance(camp.distanceMeters)}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          role="progressbar"
          aria-label={`${camp.name} is ${filled}% full`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={filled}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn('h-full rounded-full', full ? 'bg-warning' : 'bg-success')}
            style={{ width: `${filled}%` }}
          />
        </div>
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

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <MapPinned aria-hidden="true" className="size-4" />
          Show on map
        </button>
        <a
          href={directionsUrl(camp)}
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

function CampList({ loading, ...rest }: { loading: boolean } & Parameters<typeof CampResults>[0]) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-36 rounded-2xl" />
        ))}
      </div>
    )
  }
  return <CampResults {...rest} />
}

function CampResults({
  camps,
  radiusKm,
  selectedId,
  onSelect,
}: {
  camps: NearbyCamp[]
  radiusKm: number
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (camps.length === 0) {
    return (
      <EmptyState
        icon={Tent}
        title={`No open camps within ${radiusKm} km`}
        description="Try a wider radius. If you are in danger now, raise an SOS instead."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {camps.map((camp) => (
        <CampCard
          key={camp.id}
          camp={camp}
          selected={camp.id === selectedId}
          onSelect={() => onSelect(camp.id)}
        />
      ))}
    </ul>
  )
}

// Relief camps near the victim. The position comes from GPS, or a tap on the map, or the location
// saved on the profile, in that order of preference; the radius lives in the URL. A map is never the
// only way: every camp is also in the list, with its distance, free places and directions.
export function NearbyCampsView() {
  const session = useSession()
  const params = useQueryParams()
  const location = useLocationField()
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relief camps near you"
        description="Open camps around your position, nearest first, with the places they have left."
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
        <FilterChips
          label="Within"
          hideAll
          options={RADIUS_CHOICES}
          value={String(radiusKm)}
          onChange={(value) => params.set({ radius: value })}
        />
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-6">
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          {!origin ? (
            <EmptyState
              icon={MapPinned}
              title="Where are you?"
              description="Allow location access, or tap the map where you are, and we will list the camps around you."
            />
          ) : query.isError ? (
            <ListErrorState onRetry={() => query.refetch()} />
          ) : (
            <CampList
              loading={query.isPending}
              camps={camps}
              radiusKm={radiusKm}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2">
          <PlacesMap
            className="h-80 lg:h-[calc(100dvh-14rem)] lg:min-h-96"
            you={origin}
            places={camps.map((camp) => ({
              id: camp.id,
              name: camp.name,
              position: fromGeoPoint(camp.location),
              tone: camp.availableSpots <= 0 ? ('warning' as const) : ('success' as const),
            }))}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPickYou={location.setPin}
            onLocate={location.locate}
            locating={location.status === 'locating'}
          />
        </div>
      </div>
    </div>
  )
}
