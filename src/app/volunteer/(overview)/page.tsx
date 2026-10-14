import { CircleCheck, ListChecks, MapPinOff, Radar, Star, Tent, UserRoundX } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { getNearbySosPage } from '@/features/sos/sos.server'
import { ActiveTaskList } from '@/features/task/components/active-task-list'
import { countTasks, getActiveTasks } from '@/features/task/task.server'
import { requireRole } from '@/lib/auth/require-role'
import { DEFAULT_SOS_RADIUS_KM, MAX_ACTIVE_TASKS, RATING_MAX } from '@/lib/constants'
import { formatDistance } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import { Role, TaskStatus } from '@/types'

export const metadata: Metadata = { title: 'Overview' }

// A number that could not be loaded shows as a dash instead of breaking the page.
function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

const LINK_CARD =
  'flex flex-col gap-1 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50'

export default async function VolunteerOverviewPage() {
  const profile = await requireRole(Role.VOLUNTEER)
  const origin = profile.location ? fromGeoPoint(profile.location) : null

  const [active, completed, nearby] = await Promise.allSettled([
    getActiveTasks(),
    countTasks(TaskStatus.COMPLETED),
    // The overview has no GPS (that is the browser's), so it counts around the saved location.
    origin
      ? getNearbySosPage({ ...origin, radius: DEFAULT_SOS_RADIUS_KM * 1000, limit: 3 })
      : Promise.resolve(null),
  ])

  const activeTasks = settledValue(active)
  const nearbyPage = settledValue(nearby)
  const firstName = profile.name.split(' ')[0]
  const rated = profile.totalRatings > 0

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Find people who need help near you, follow the requests you have taken, and hand out aid from your camps."
      />

      {!profile.isAvailable && (
        <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-sm">
          <UserRoundX aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            You are marked as not available.{' '}
            <Link
              href="/volunteer/profile"
              className="font-medium text-link underline-offset-4 hover:underline"
            >
              Turn availability back on
            </Link>{' '}
            when you can help.
          </span>
        </p>
      )}

      <section aria-label="Your numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="Active tasks"
          value={activeTasks ? activeTasks.length : '–'}
          hint={`Up to ${MAX_ACTIVE_TASKS} at a time`}
          href="/volunteer/tasks"
        />
        <StatCard
          icon={CircleCheck}
          label="Completed"
          value={settledValue(completed) ?? '–'}
          hint="Tasks you have finished"
        />
        <StatCard
          icon={Radar}
          label={`Requests within ${DEFAULT_SOS_RADIUS_KM} km`}
          value={nearbyPage ? nearbyPage.meta.total : '–'}
          hint={origin ? 'Around your saved location' : 'Save a location to see this'}
          href="/volunteer/nearby"
        />
        <StatCard
          icon={Star}
          label="Your rating"
          value={rated ? `${profile.reliabilityScore.toFixed(1)} / ${RATING_MAX}` : '–'}
          hint={
            rated
              ? `From ${profile.totalRatings} ${profile.totalRatings === 1 ? 'rating' : 'ratings'}`
              : 'People you help can rate you'
          }
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-labelledby="active-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="active-heading" className="text-lg">
              Your active tasks
            </h2>
            <Link
              href="/volunteer/tasks"
              className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              See all
            </Link>
          </div>
          {activeTasks ? (
            <ActiveTaskList tasks={activeTasks} />
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              We could not load your tasks. Refresh the page to try again.
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-3">
          <Link href="/volunteer/nearby" className={LINK_CARD}>
            <span className="flex items-center gap-2 font-semibold">
              <Radar aria-hidden="true" className="size-5 text-info" />
              Requests near you
            </span>
            {nearbyPage && nearbyPage.items.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                The closest is about {formatDistance(nearbyPage.items[0]?.distanceMeters ?? 0)}{' '}
                away. Open the map to see them all.
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                See who is waiting for a volunteer, on a map and in a list.
              </span>
            )}
          </Link>
          <Link href="/volunteer/camps" className={LINK_CARD}>
            <span className="flex items-center gap-2 font-semibold">
              <Tent aria-hidden="true" className="size-5 text-success" />
              Your camps
            </span>
            <span className="text-sm text-muted-foreground">
              See what each camp has in stock and hand out aid.
            </span>
          </Link>
          {!origin && (
            <Link href="/volunteer/profile" className={LINK_CARD}>
              <span className="flex items-center gap-2 font-semibold">
                <MapPinOff aria-hidden="true" className="size-5 text-warning" />
                Save your location
              </span>
              <span className="text-sm text-muted-foreground">
                The overview counts requests around it. The map page uses your live position
                instead.
              </span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  )
}
