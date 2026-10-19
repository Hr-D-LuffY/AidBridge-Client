'use client'

import { MapPinned, Radar, TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { ListErrorState } from '@/components/shared/list-error-state'
import { LocationStatus } from '@/components/shared/location-status'
import { MapControlBar } from '@/components/shared/map-control-bar'
import { MultiFilterChips } from '@/components/shared/multi-filter-chips'
import { PageHeader } from '@/components/shared/page-header'
import { PlacesMap } from '@/components/shared/places-map'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrentTasksPanel } from '@/features/task/components/current-tasks-panel'
import { OffersPanel } from '@/features/task/components/offers-panel'
import { TASK_MAP_LEGEND, toTaskMapPlace } from '@/features/task/task.map'
import { useActiveTasksQuery } from '@/features/task/task.queries'
import { OffDutyNotice } from '@/features/user/components/off-duty-notice'
import { useLocationField } from '@/hooks/use-location-field'
import { usePolling } from '@/hooks/use-polling'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import {
  DEFAULT_SOS_RADIUS_KM,
  NEARBY_PAGE_SIZE,
  POLL_INTERVAL_MS,
  SOS_RADIUS_OPTIONS_KM,
} from '@/lib/constants'
import { fromGeoPoint } from '@/lib/geo'
import { asList } from '@/lib/params'
import { SKILL_OPTIONS } from '@/lib/skills'
import { cn } from '@/lib/utils'
import { type NearbySos, Priority, Skill } from '@/types'
import {
  NEARBY_MAP_LEGEND,
  NEARBY_SORT_OPTIONS,
  parseNearbySort,
  sortNearby,
  toNearbyMapPlace,
} from '../sos.nearby'
import { useNearbySosQuery } from '../sos.queries'
import { NearbyCard } from './nearby-card'

const MAP_ID = 'nearby-map'

// Three decimals is about 100 m: a GPS fix that wobbles by a few metres does not ask the backend again.
const roundCoordinate = (value: number) => Math.round(value * 1000) / 1000

function RequestList({
  requests,
  selectedId,
  onShowOnMap,
}: {
  requests: NearbySos[]
  selectedId: string | null
  onShowOnMap: (id: string) => void
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {requests.map((sos) => (
        <NearbyCard
          key={sos.id}
          sos={sos}
          selected={sos.id === selectedId}
          onShowOnMap={() => onShowOnMap(sos.id)}
        />
      ))}
    </ul>
  )
}

// Requests waiting for a volunteer, around the volunteer: one big map and the same requests as a list
// below it. The position comes from GPS, a tap on the map, or the location saved on the profile. The
// radius (5 to 50 km) and the sort order live in the URL, and the list looks for new requests every
// half minute while the tab is open.
export function NearbyView() {
  const session = useSession()
  const router = useRouter()
  const params = useQueryParams()
  const location = useLocationField()
  const reduceMotion = usePrefersReducedMotion()
  const poll = usePolling(POLL_INTERVAL_MS.nearby)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const radiusKm =
    SOS_RADIUS_OPTIONS_KM.find((km) => String(km) === params.get('radius')) ?? DEFAULT_SOS_RADIUS_KM
  const sort = parseNearbySort(params.get('sort'))
  // ?skills=boat,medical keeps the requests that want any of them; a hand-edited value means no filter.
  const skills = asList(Object.values(Skill), params.get('skills'))

  const profilePosition = session.location ? fromGeoPoint(session.location) : null
  const origin = location.position ?? profilePosition
  const usingProfile = !location.position && profilePosition !== null

  const query = useNearbySosQuery(
    origin
      ? {
          lng: roundCoordinate(origin.lng),
          lat: roundCoordinate(origin.lat),
          radius: radiusKm * 1000,
          limit: NEARBY_PAGE_SIZE,
          ...(skills.length > 0 && { skills }),
        }
      : null,
    poll,
  )
  // The requests this volunteer has already taken. They are on the same map, so how far each one is and
  // where they are going never needs a trip to another page.
  const activeTasks = useActiveTasksQuery(poll).data ?? []
  const taskPlaces = activeTasks.map((task) => toTaskMapPlace(task, origin))

  const requests = sortNearby(query.data?.items ?? [], sort)
  const places = [...requests.map(toNearbyMapPlace), ...taskPlaces]
  const total = query.data?.meta.total ?? 0
  const criticalCount = requests.filter((sos) => sos.priority === Priority.CRITICAL).length

  // From the list: pick the request and bring the map into view so the volunteer sees where it is.
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
        description="Allow location access, or tap the map where you are, and we will list the requests around you."
      />
    )
  } else if (query.isError && !query.data) {
    list = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.isPending) {
    list = (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-52 rounded-2xl" />
        ))}
      </div>
    )
  } else if (requests.length === 0) {
    list = (
      <EmptyState
        icon={Radar}
        title={`No open requests within ${radiusKm} km`}
        description={
          skills.length > 0
            ? 'None of them ask for the skills you picked. Clear the skills filter to see every request.'
            : 'That is good news. New requests appear here on their own, or try a wider radius.'
        }
      />
    )
  } else {
    list = (
      <>
        <RequestList requests={requests} selectedId={selectedId} onShowOnMap={showOnMap} />
        {total > requests.length && (
          <p className="text-sm text-muted-foreground">
            Showing the nearest {requests.length} of {total} requests. Choose a smaller radius to
            see the others.
          </p>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Requests near you"
        description="People waiting for a volunteer, nearest first. You see a first name and a rounded position only; the phone number and exact location are shared when you accept."
      />

      <OffDutyNotice profile={session} />

      <OffersPanel />

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

      {/* With a task in hand, the map has a narrow bar beside it with that task (on a phone the bar
          comes first, above the map). */}
      <div
        className={cn(
          'grid gap-4',
          activeTasks.length > 0 && 'lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start',
        )}
      >
        <CurrentTasksPanel
          tasks={activeTasks}
          origin={origin}
          selectedId={selectedId}
          onShowOnMap={showOnMap}
        />
        <section id={MAP_ID} aria-label="Map of requests" className="scroll-mt-24 lg:order-first">
          <PlacesMap
            className="h-[34rem] lg:h-[calc(100dvh-9rem)] lg:min-h-[36rem]"
            header={
              <MapControlBar
                radius={{
                  valueKm: radiusKm,
                  options: SOS_RADIUS_OPTIONS_KM,
                  onChange: (km) => params.set({ radius: String(km) }),
                }}
                onRefresh={() => query.refetch()}
                refreshDisabled={!origin || query.isFetching}
                refreshing={query.isFetching}
                updatedAt={query.dataUpdatedAt}
                error={query.isError ? 'Could not load the requests.' : null}
                chips={[
                  { label: `${total} TOTAL`, tone: 'blue' },
                  ...(criticalCount > 0
                    ? [{ label: `${criticalCount} CRITICAL`, tone: 'red' as const }]
                    : []),
                  ...(activeTasks.length > 0
                    ? [{ label: `${activeTasks.length} YOUR TASK`, tone: 'green' as const }]
                    : []),
                ]}
              />
            }
            you={origin}
            places={places}
            legend={
              activeTasks.length > 0 ? [...NEARBY_MAP_LEGEND, TASK_MAP_LEGEND] : NEARBY_MAP_LEGEND
            }
            routeTo={taskPlaces.map((place) => place.position)}
            radiusMeters={origin ? radiusKm * 1000 : null}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={(id) => {
              const href = places.find((place) => place.id === id)?.href
              if (href) router.push(href)
            }}
            onPickYou={location.setPin}
            onLocate={location.locate}
            locating={location.status === 'locating'}
            emptyNote={
              origin && !query.isPending && requests.length === 0 ? (
                <>
                  <p className="font-semibold">No open requests</p>
                  <p className="text-sm">within {radiusKm} km of you</p>
                </>
              ) : null
            }
          />
        </section>
      </div>

      <section aria-labelledby="nearby-list-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="nearby-list-heading" className="text-lg">
            Requests in range
          </h2>
          {requests.length > 1 && (
            <FilterChips
              label="Order"
              hideAll
              options={NEARBY_SORT_OPTIONS}
              value={sort}
              onChange={(next) => next && params.set({ sort: next })}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <MultiFilterChips
            label="Skills"
            allLabel="Any"
            options={SKILL_OPTIONS}
            value={skills}
            onChange={(next) => params.set({ skills: next.join(',') })}
          />
          {skills.length === 0 && session.skills.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="h-11 px-4"
              onClick={() => params.set({ skills: session.skills.join(',') })}
            >
              Use my skills
            </Button>
          )}
        </div>
        {query.isError && origin && query.data && (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
            Could not refresh the list. Showing the last one we have.
          </p>
        )}
        {list}
      </section>
    </div>
  )
}
