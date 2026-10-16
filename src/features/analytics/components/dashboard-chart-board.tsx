import { Clock, Flag, HandHeart, Hourglass, ShieldCheck, Siren } from 'lucide-react'
import Link from 'next/link'
import { SectionError } from '@/components/shared/section-error'
import { StatCard } from '@/components/shared/stat-card'
import {
  aidSlices,
  type DashboardData,
  formatCount,
  formatMinutes,
  headline,
  prioritySlices,
  statusSlices,
  volunteerSlices,
} from '../analytics.model'
import { capitalise } from '../analytics.params'
import { ColumnChart, DonutChart, RankedBarChart } from './charts'
import { NothingYet, Panel, SEE_ALL_LINK, SliceList } from './parts'

// Design 1, "Chart board": six headline numbers, then one chart per question (status, priority, who did the
// work, what was handed out). Every chart has its numbers in words beside or under it.
export function DashboardChartBoard({ analytics, incidents, period }: DashboardData) {
  if (!analytics) return <SectionError title="The dashboard numbers" />

  const numbers = headline(analytics)
  const status = statusSlices(analytics.requestsByStatus)
  const priority = prioritySlices(analytics.requestsByPriority)
  const volunteers = volunteerSlices(analytics)
  const aid = aidSlices(analytics)

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <li>
          <StatCard
            icon={Siren}
            label="Requests raised"
            value={formatCount(numbers.total)}
            hint={capitalise(period)}
            href="/admin/sos"
          />
        </li>
        <li>
          <StatCard
            icon={ShieldCheck}
            label="Rescued"
            value={formatCount(numbers.rescued)}
            hint={`${numbers.rescueRate}% of the requests raised`}
            href="/admin/sos?status=rescued"
          />
        </li>
        <li>
          <StatCard
            icon={Hourglass}
            label="Waiting for a volunteer"
            value={formatCount(numbers.waiting)}
            hint="Nobody has taken these yet"
            href="/admin/sos?status=pending"
          />
        </li>
        <li>
          <StatCard
            icon={Clock}
            label="Average response time"
            value={formatMinutes(analytics.avgResponseTime)}
            hint="From raised to a volunteer accepting"
          />
        </li>
        <li>
          <StatCard
            icon={HandHeart}
            label="Active volunteers"
            value={formatCount(analytics.summary.volunteerCount)}
            hint="Accounts that can take requests, all time"
            href="/admin/users?role=volunteer"
          />
        </li>
        <li>
          <StatCard
            icon={Flag}
            label="Active incidents"
            value={incidents ? formatCount(incidents.active) : '–'}
            hint={incidents ? `${formatCount(incidents.critical)} of them critical` : undefined}
            href="/admin/incidents?status=active"
          />
        </li>
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Requests by status" description={`Raised ${period}.`}>
          {numbers.total > 0 ? (
            <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,15rem)_1fr]">
              <DonutChart
                rows={status}
                total={numbers.total}
                centerLabel="requests"
                unit="Requests"
              />
              <SliceList slices={status} total={numbers.total} />
            </div>
          ) : (
            <NothingYet>No request was raised {period}.</NothingYet>
          )}
        </Panel>

        <Panel title="Requests by priority" description="Most urgent first. Tap a row to see them.">
          {numbers.total > 0 ? (
            <>
              <ColumnChart rows={priority} unit="Requests" height={200} />
              <SliceList slices={priority} total={numbers.total} />
            </>
          ) : (
            <NothingYet>No request was raised {period}.</NothingYet>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Most active volunteers"
          description="Tasks completed in the period, top 10."
          action={
            <Link href="/admin/users?role=volunteer" className={SEE_ALL_LINK}>
              All volunteers
            </Link>
          }
        >
          {volunteers.length > 0 ? (
            <RankedBarChart rows={volunteers} unit="Tasks completed" />
          ) : (
            <NothingYet>No volunteer completed a task {period}.</NothingYet>
          )}
        </Panel>

        <Panel
          title="Aid handed out"
          description="Top 20 items. Each item is counted in its own unit, so bars of different units are not comparable."
          action={
            <Link href="/admin/distribution" className={SEE_ALL_LINK}>
              Hand-out history
            </Link>
          }
        >
          {aid.length > 0 ? (
            <RankedBarChart rows={aid} unit="Handed out" />
          ) : (
            <NothingYet>Nothing was handed out {period}.</NothingYet>
          )}
        </Panel>
      </div>
    </div>
  )
}
