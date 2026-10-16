import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import {
  parseRange,
  rangeText,
  toAnalyticsQuery,
  toPreviousPeriod,
} from '@/features/analytics/analytics.params'
import { getAnalytics, getReport } from '@/features/analytics/analytics.server'
import { RangePicker } from '@/features/analytics/components/range-picker'
import { ReportView } from '@/features/analytics/components/report-view'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Reports' }

type PageProps = {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}

// A number that could not be loaded is null, and its layout shows an error for that part only.
function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

// The report totals and the dashboard numbers are two calls for the period in the URL, and the comparison
// asks the same two for the stretch just before it.
export default async function AdminReportsPage({ searchParams }: PageProps) {
  const view = parseRange(await searchParams, '30d')
  const query = toAnalyticsQuery(view)
  const earlier = toPreviousPeriod(view)

  const [report, analytics, earlierReport, earlierAnalytics] = await Promise.allSettled([
    getReport(query),
    getAnalytics(query),
    earlier ? getReport(earlier.query) : Promise.resolve(null),
    earlier ? getAnalytics(earlier.query) : Promise.resolve(null),
  ])
  const data = {
    report: settledValue(report),
    analytics: settledValue(analytics),
    period: rangeText(view),
    preparedOn: formatDate(new Date()),
    previous: earlier
      ? {
          report: settledValue(earlierReport),
          analytics: settledValue(earlierAnalytics),
          text: earlier.text,
        }
      : null,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Requests, response and aid for a period you choose, set beside the stretch just before it. Pick a ready-made period or set your own days."
      />

      <RangePicker defaultPreset="30d" />

      <ReportView {...data} />
    </div>
  )
}
