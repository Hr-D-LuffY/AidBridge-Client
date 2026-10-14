import { Bell, CircleCheck, HandHeart, Siren, Tent, TriangleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { buttonVariants } from '@/components/ui/button'
import { getUnreadNotificationCount } from '@/features/notification/notification.server'
import { RecentRequests } from '@/features/sos/components/recent-requests'
import { countSos, getSosPage } from '@/features/sos/sos.server'
import { requireRole } from '@/lib/auth/require-role'
import { MAX_ACTIVE_SOS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Role, SosStatus } from '@/types'

export const metadata: Metadata = { title: 'Overview' }

// A number that could not be loaded shows as a dash instead of breaking the page.
function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

export default async function VictimOverviewPage() {
  const profile = await requireRole(Role.VICTIM)

  const [recent, pending, assigned, onTheWay, rescued, unread] = (await Promise.allSettled([
    getSosPage({ limit: 5 }),
    countSos(SosStatus.PENDING),
    countSos(SosStatus.ASSIGNED),
    countSos(SosStatus.ON_THE_WAY),
    countSos(SosStatus.RESCUED),
    getUnreadNotificationCount(),
  ])) as [
    PromiseSettledResult<Awaited<ReturnType<typeof getSosPage>>>,
    PromiseSettledResult<number>,
    PromiseSettledResult<number>,
    PromiseSettledResult<number>,
    PromiseSettledResult<number>,
    PromiseSettledResult<number>,
  ]

  const counts = [settledValue(pending), settledValue(assigned), settledValue(onTheWay)]
  const open = counts.every((count) => count !== null)
    ? counts.reduce<number>((sum, count) => sum + (count ?? 0), 0)
    : null
  const atLimit = open !== null && open >= MAX_ACTIVE_SOS
  const firstName = profile.name.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Ask for help, follow your requests, and find relief camps near you."
      />

      <section
        aria-labelledby="sos-cta"
        className={cn(
          'flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6',
          atLimit ? 'bg-warning-soft' : 'border-primary/30 bg-sidebar-accent',
        )}
      >
        <div className="flex flex-col gap-1">
          <h2 id="sos-cta" className="text-xl">
            {atLimit ? 'You have reached the limit' : 'Need help right now?'}
          </h2>
          <p className="max-w-xl text-sm">
            {atLimit
              ? `You can have ${MAX_ACTIVE_SOS} open requests at a time. Close or finish one to raise another.`
              : 'Raise an SOS with your location and what you need. Volunteers nearby see it at once.'}
          </p>
        </div>
        {atLimit ? (
          <Link
            href="/dashboard/sos"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-12 shrink-0 gap-2 px-6 text-base',
            )}
          >
            <TriangleAlert aria-hidden="true" />
            See my requests
          </Link>
        ) : (
          <Link
            href="/dashboard/sos/new"
            className={cn(
              buttonVariants(),
              'h-12 shrink-0 gap-2 bg-cta px-6 text-base font-bold text-cta-foreground hover:bg-cta/90',
            )}
          >
            <Siren aria-hidden="true" />
            Raise SOS
          </Link>
        )}
      </section>

      <section aria-label="Your numbers" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Siren}
          label="Open requests"
          value={open ?? '–'}
          hint={`Up to ${MAX_ACTIVE_SOS} at a time`}
          href="/dashboard/sos"
        />
        <StatCard
          icon={CircleCheck}
          label="Rescued"
          value={settledValue(rescued) ?? '–'}
          hint="Requests that ended in a rescue"
        />
        <StatCard
          icon={Bell}
          label="Unread notifications"
          value={settledValue(unread) ?? '–'}
          hint="Alerts and updates for you"
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-lg">
              Recent requests
            </h2>
            <Link
              href="/dashboard/sos"
              className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              See all
            </Link>
          </div>
          {recent.status === 'fulfilled' ? (
            <RecentRequests requests={recent.value.items} />
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              We could not load your requests. Refresh the page to try again.
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-3">
          <Link
            href="/dashboard/camps"
            className="flex flex-col gap-1 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Tent aria-hidden="true" className="size-5 text-success" />
              Relief camps near you
            </span>
            <span className="text-sm text-muted-foreground">
              See open camps, how many places are free, and directions.
            </span>
          </Link>
          <Link
            href="/dashboard/volunteer-request"
            className="flex flex-col gap-1 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex items-center gap-2 font-semibold">
              <HandHeart aria-hidden="true" className="size-5 text-info" />
              Become a volunteer
            </span>
            <span className="text-sm text-muted-foreground">
              Want to help others? Ask an administrator to approve you.
            </span>
          </Link>
        </aside>
      </div>
    </div>
  )
}
