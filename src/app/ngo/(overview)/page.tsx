import { Map as MapIcon, PackageOpen, Tent, TriangleAlert, Truck, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { CAMP_OPTIONS_PARAMS } from '@/features/camp/camp.params'
import { getManagedCamps } from '@/features/camp/camp.server'
import { RECENT_DISTRIBUTION_PARAMS } from '@/features/distribution/distribution.params'
import { getDistributionPage } from '@/features/distribution/distribution.server'
import { LOW_STOCK_PARAMS } from '@/features/inventory/inventory.params'
import { getLowStock } from '@/features/inventory/inventory.server'
import { requireRole } from '@/lib/auth/require-role'
import { formatRelativeTime } from '@/lib/format'
import { getReliefLabel } from '@/lib/relief'
import { Role } from '@/types'

export const metadata: Metadata = { title: 'Overview' }

// A number that could not be loaded shows as a dash instead of breaking the page.
function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

const LINK_CARD =
  'flex flex-col gap-1 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50'

const SEE_ALL =
  'inline-flex min-h-11 items-center rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'

const LOAD_FAILED = 'rounded-2xl border border-dashed p-6 text-sm text-muted-foreground'

export default async function NgoOverviewPage() {
  const profile = await requireRole(Role.NGO)

  const [camps, lowStock, handOuts] = await Promise.allSettled([
    getManagedCamps(CAMP_OPTIONS_PARAMS),
    getLowStock(LOW_STOCK_PARAMS),
    getDistributionPage(RECENT_DISTRIBUTION_PARAMS),
  ])

  const campPage = settledValue(camps)
  const lowPage = settledValue(lowStock)
  const handOutPage = settledValue(handOuts)

  const openCamps = campPage?.items.filter((camp) => camp.isActive) ?? []
  const peopleInside = openCamps.reduce((sum, camp) => sum + camp.currentOccupancy, 0)
  const placesFree = openCamps.reduce((sum, camp) => sum + camp.availableSpots, 0)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome, ${profile.name.split(' ')[0]}`}
        description="Run your relief camps, keep your stock up to date and see what your volunteers hand out."
      />

      <section aria-label="Your numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Tent}
          label="Camps"
          value={campPage ? campPage.meta.total : '–'}
          hint={campPage ? `${openCamps.length} open right now` : undefined}
          href="/ngo/camps"
        />
        <StatCard
          icon={Users}
          label="People in your camps"
          value={campPage ? peopleInside : '–'}
          hint={campPage ? `${placesFree} places free in open camps` : undefined}
          href="/ngo/camps"
        />
        <StatCard
          icon={TriangleAlert}
          label="Items running low"
          value={lowPage ? lowPage.meta.total : '–'}
          hint="At or below their low-stock level"
          href="/ngo/inventory?low=1"
        />
        <StatCard
          icon={Truck}
          label="Hand-outs"
          value={handOutPage ? handOutPage.meta.total : '–'}
          hint="From your camps, all time"
          href="/ngo/distribution"
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="low-heading" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="low-heading" className="text-lg">
                Running low
              </h2>
              <Link href="/ngo/inventory?low=1" className={SEE_ALL}>
                See all
              </Link>
            </div>
            {!lowPage ? (
              <p className={LOAD_FAILED}>
                We could not load your stock. Refresh the page to try again.
              </p>
            ) : lowPage.items.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title="Nothing is running low"
                description="Items at or below their low-stock level show up here, emptiest first."
              />
            ) : (
              <ul className="divide-y rounded-2xl border bg-card">
                {lowPage.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {getReliefLabel(item.category)} · {item.camp?.name ?? 'General store'}
                      </p>
                    </div>
                    <p className="text-sm">
                      <span className="font-semibold text-warning tabular-nums">
                        {item.quantity}
                      </span>{' '}
                      {item.unit} left
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-heading" className="text-lg">
                Latest hand-outs
              </h2>
              <Link href="/ngo/distribution" className={SEE_ALL}>
                See all
              </Link>
            </div>
            {!handOutPage ? (
              <p className={LOAD_FAILED}>
                We could not load the hand-outs. Refresh the page to try again.
              </p>
            ) : handOutPage.items.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Nothing handed out yet"
                description="When a volunteer hands out stock from one of your camps, it shows up here."
              />
            ) : (
              <ul className="divide-y rounded-2xl border bg-card">
                {handOutPage.items.map((record) => (
                  <li
                    key={record.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        <span className="tabular-nums">{record.item.quantity}</span>{' '}
                        {record.item.unit} of {record.item.itemName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        To {record.recipient.name} from {record.camp.name}, by{' '}
                        {record.volunteer.name}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(record.distributedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <Link href="/ngo/live-map" className={LINK_CARD}>
            <span className="flex items-center gap-2 font-semibold">
              <MapIcon aria-hidden="true" className="size-5 text-info" />
              Live map
            </span>
            <span className="text-sm text-muted-foreground">
              See open requests and relief camps on one map.
            </span>
          </Link>
          <Link href="/ngo/camps" className={LINK_CARD}>
            <span className="flex items-center gap-2 font-semibold">
              <Tent aria-hidden="true" className="size-5 text-success" />
              Your camps
            </span>
            <span className="text-sm text-muted-foreground">
              Update the head count and assign volunteers.
            </span>
          </Link>
          <Link href="/ngo/inventory" className={LINK_CARD}>
            <span className="flex items-center gap-2 font-semibold">
              <PackageOpen aria-hidden="true" className="size-5 text-warning" />
              Inventory
            </span>
            <span className="text-sm text-muted-foreground">
              Add stock and keep the amounts right.
            </span>
          </Link>
        </aside>
      </div>
    </div>
  )
}
