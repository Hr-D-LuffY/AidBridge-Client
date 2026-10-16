import {
  type Analytics,
  type CountRow,
  type IncidentSummary,
  Priority,
  type Report,
  SosStatus,
} from '@/types'

// How the dashboard and the report show the backend's numbers. A plain module, so Server and Client
// Components can both import it. Colours are the theme tokens (globals.css); every one is paired with
// its word wherever it is drawn, so colour is never the only signal.

export type Slice = {
  key: string
  label: string
  value: number
  color: string
  // A list that already shows this slice's requests (the admin SOS list filtered by it).
  href?: string
}

const STATUS_STYLE: Record<SosStatus, { label: string; color: string }> = {
  [SosStatus.PENDING]: { label: 'Waiting for a volunteer', color: 'var(--chart-3)' },
  [SosStatus.ASSIGNED]: { label: 'Volunteer assigned', color: 'var(--chart-2)' },
  [SosStatus.ON_THE_WAY]: { label: 'Help on the way', color: 'var(--high)' },
  [SosStatus.RESCUED]: { label: 'Rescued', color: 'var(--chart-4)' },
  [SosStatus.CLOSED]: { label: 'Closed', color: 'var(--muted-foreground)' },
}

const PRIORITY_STYLE: Record<Priority, { label: string; color: string }> = {
  [Priority.LOW]: { label: 'Low', color: 'var(--chart-2)' },
  [Priority.MEDIUM]: { label: 'Medium', color: 'var(--chart-3)' },
  [Priority.HIGH]: { label: 'High', color: 'var(--high)' },
  [Priority.CRITICAL]: { label: 'Critical', color: 'var(--destructive)' },
}

export function statusSlices(rows: CountRow<SosStatus>[]): Slice[] {
  return rows.map((row) => ({
    key: row._id,
    label: STATUS_STYLE[row._id].label,
    value: row.count,
    color: STATUS_STYLE[row._id].color,
    href: `/admin/sos?status=${row._id}`,
  }))
}

// Most urgent first, whatever order the backend sends.
export function prioritySlices(rows: CountRow<Priority>[]): Slice[] {
  const order = [Priority.CRITICAL, Priority.HIGH, Priority.MEDIUM, Priority.LOW]
  return order.map((priority) => ({
    key: priority,
    label: PRIORITY_STYLE[priority].label,
    value: rows.find((row) => row._id === priority)?.count ?? 0,
    color: PRIORITY_STYLE[priority].color,
    href: `/admin/sos?priority=${priority}`,
  }))
}

export const sumSlices = (slices: Slice[]) =>
  slices.reduce((total, slice) => total + slice.value, 0)

// A whole percent; 0 when there is nothing to be a percentage of.
export function percentOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

export const formatCount = (value: number) => value.toLocaleString('en-US')

// Minutes from raised to accepted: "None yet", "12.5 min", "1 h 20 min".
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return 'None yet'
  if (minutes < 60) return `${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)} min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export type VolunteerRow = { key: string; name: string; completed: number }

export function volunteerRows(analytics: Analytics): VolunteerRow[] {
  return analytics.volunteerActivity.map((row) => ({
    key: row._id,
    name: row.name,
    completed: row.completedTasks,
  }))
}

export type AidRow = { key: string; item: string; unit: string; total: number }

export function aidRows(analytics: Analytics): AidRow[] {
  return analytics.distributionByItem.map((row) => ({
    key: `${row._id}-${row.unit}`,
    item: row._id,
    unit: row.unit,
    total: row.totalDistributed,
  }))
}

// The few numbers every layout leads with, worked out once from the backend's own counts.
export function headline(analytics: Analytics) {
  const { totalRequests, rescuedCount, pendingCount } = analytics.summary
  const count = (status: SosStatus) =>
    analytics.requestsByStatus.find((row) => row._id === status)?.count ?? 0
  return {
    total: totalRequests,
    rescued: rescuedCount,
    waiting: pendingCount,
    inProgress: count(SosStatus.ASSIGNED) + count(SosStatus.ON_THE_WAY),
    closed: count(SosStatus.CLOSED),
    rescueRate: percentOf(rescuedCount, totalRequests),
  }
}

// Volunteers and handed-out items as chart rows (the same shape as the status and priority slices).
export function volunteerSlices(analytics: Analytics): Slice[] {
  return volunteerRows(analytics).map((row) => ({
    key: row.key,
    label: row.name,
    value: row.completed,
    color: 'var(--chart-2)',
  }))
}

export function aidSlices(analytics: Analytics): Slice[] {
  return aidRows(analytics).map((row) => ({
    key: row.key,
    label: `${row.item} (${row.unit})`,
    value: row.total,
    color: 'var(--chart-4)',
  }))
}

// What a dashboard layout gets. A part that could not be loaded is null, and the layout shows an error
// for that part only.
export type DashboardData = {
  analytics: Analytics | null
  incidents: IncidentSummary | null
  // The period in words, with its preposition: "in the last 30 days", "since the start".
  period: string
}

// What a report layout gets. The report totals and the dashboard numbers are separate calls, so either may
// be missing; a layout shows what it has.
export type ReportData = {
  report: Report | null
  analytics: Analytics | null
  // The period in words, with its preposition: "in the last 30 days", "since the start".
  period: string
  // Today, as text, for the "prepared on" line.
  preparedOn: string
  // The stretch just before, for comparing; null when this period has none ("since the start").
  previous: PreviousData | null
}

export type PreviousData = {
  report: Report | null
  analytics: Analytics | null
  // "1 Sep 2026 to 30 Sep 2026"
  text: string
}

// The report's three-way split. Only the report's own counts are used, so it works without the dashboard
// numbers; "everything else" is assigned, on the way or closed.
export function reportSlices(report: Report): Slice[] {
  const other = Math.max(0, report.totalSOSRequests - report.rescued - report.pending)
  return [
    {
      key: 'rescued',
      label: 'Rescued',
      value: report.rescued,
      color: 'var(--chart-4)',
      href: '/admin/sos?status=rescued',
    },
    {
      key: 'waiting',
      label: 'Waiting for a volunteer',
      value: report.pending,
      color: 'var(--chart-3)',
      href: '/admin/sos?status=pending',
    },
    {
      key: 'other',
      label: 'Assigned, on the way or closed',
      value: other,
      color: 'var(--muted-foreground)',
    },
  ]
}
