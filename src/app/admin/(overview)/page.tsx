import { Map as MapIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { parseRange, rangeText, toAnalyticsQuery } from '@/features/analytics/analytics.params'
import { getAnalytics, getIncidentSummary } from '@/features/analytics/analytics.server'
import { DashboardChartBoard } from '@/features/analytics/components/dashboard-chart-board'
import { RangePicker } from '@/features/analytics/components/range-picker'
import { requireRole } from '@/lib/auth/require-role'
import { cn } from '@/lib/utils'
import { Role } from '@/types'

export const metadata: Metadata = { title: 'Overview' }

type PageProps = {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}

// A number that could not be loaded is null, and the board shows an error for that part only.
function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

// The period is in the URL, so the page reads it and asks the backend for exactly that stretch.
export default async function AdminOverviewPage({ searchParams }: PageProps) {
  const profile = await requireRole(Role.ADMIN)
  const view = parseRange(await searchParams, 'all')

  const [analytics, incidents] = await Promise.allSettled([
    getAnalytics(toAnalyticsQuery(view)),
    getIncidentSummary(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome, ${profile.name.split(' ')[0]}`}
        description="How the response is going across the platform: requests, volunteers, incidents and aid."
        actions={
          <>
            <Link
              href="/admin/reports"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4')}
            >
              Report
            </Link>
            <Link
              href="/admin/live-map"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4')}
            >
              <MapIcon aria-hidden="true" />
              Live map
            </Link>
          </>
        }
      />

      <RangePicker defaultPreset="all" />

      <DashboardChartBoard
        analytics={settledValue(analytics)}
        incidents={settledValue(incidents)}
        period={rangeText(view)}
      />
    </div>
  )
}
