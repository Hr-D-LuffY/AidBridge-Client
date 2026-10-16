import { differenceInCalendarDays, format, subDays } from 'date-fns'
import type { AnalyticsQuery } from '@/types'

// The period the dashboard and the report cover. It lives in the URL, so a refresh or a shared link shows
// the same numbers: ?range=7d|30d|90d|all, or ?from=YYYY-MM-DD&to=YYYY-MM-DD for a custom stretch.
export const RANGE_PRESETS = [
  { value: '7d', days: 7, label: '7 days', title: 'in the last 7 days' },
  { value: '30d', days: 30, label: '30 days', title: 'in the last 30 days' },
  { value: '90d', days: 90, label: '90 days', title: 'in the last 90 days' },
  { value: 'all', days: null, label: 'All time', title: 'since the start' },
] as const

export type RangePreset = (typeof RANGE_PRESETS)[number]['value']

export type RangeView =
  | { kind: 'preset'; preset: RangePreset }
  | { kind: 'custom'; from: string | undefined; to: string | undefined }

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isDate(value: string | undefined): value is string {
  return value !== undefined && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value))
}

// The URL is the source of truth, so each value is checked: a hand-edited ?range=nope or ?from=banana means
// "use the default" instead of reaching the backend as a 400. A start after the end counts as no custom range.
export function parseRange(
  raw: { range?: string; from?: string; to?: string },
  fallback: RangePreset,
): RangeView {
  const from = isDate(raw.from) ? raw.from : undefined
  const to = isDate(raw.to) ? raw.to : undefined
  if ((from || to) && !(from && to && from > to)) return { kind: 'custom', from, to }
  const preset = RANGE_PRESETS.find((option) => option.value === raw.range)?.value
  return { kind: 'preset', preset: preset ?? fallback }
}

// What the backend gets. "Last 7 days" runs from six days ago to now, so today counts as one of them.
export function toAnalyticsQuery(view: RangeView, now = new Date()): AnalyticsQuery {
  if (view.kind === 'custom') return { startDate: view.from, endDate: view.to }
  const days = RANGE_PRESETS.find((option) => option.value === view.preset)?.days
  return days ? { startDate: format(subDays(now, days - 1), 'yyyy-MM-dd') } : {}
}

// "2026-10-03" -> "3 Oct 2026", read as a plain calendar day so the time zone cannot move it.
function dayText(value: string): string {
  return format(new Date(`${value}T00:00:00`), 'd MMM yyyy')
}

// For headings and sentences, with its own preposition: "in the last 30 days", "since the start",
// "from 3 Oct 2026 to 9 Oct 2026".
export function rangeText(view: RangeView): string {
  if (view.kind === 'preset') {
    return RANGE_PRESETS.find((option) => option.value === view.preset)?.title ?? 'since the start'
  }
  if (view.from && view.to) return `from ${dayText(view.from)} to ${dayText(view.to)}`
  if (view.from) return `since ${dayText(view.from)}`
  return `up to ${view.to ? dayText(view.to) : 'today'}`
}

// The stretch of the same length just before the chosen one, to compare with. Only a period with a known
// length has one: the three ready-made ones and a custom range with both ends. "Since the start" has nothing
// before it.
export function toPreviousPeriod(
  view: RangeView,
  now = new Date(),
): { query: AnalyticsQuery; text: string } | null {
  let days: number
  let end: Date
  if (view.kind === 'preset') {
    const presetDays = RANGE_PRESETS.find((option) => option.value === view.preset)?.days
    if (!presetDays) return null
    days = presetDays
    end = subDays(now, presetDays)
  } else {
    if (!view.from || !view.to) return null
    const from = new Date(`${view.from}T00:00:00`)
    days = differenceInCalendarDays(new Date(`${view.to}T00:00:00`), from) + 1
    end = subDays(from, 1)
  }
  const start = subDays(end, days - 1)
  const startDate = format(start, 'yyyy-MM-dd')
  const endDate = format(end, 'yyyy-MM-dd')
  return { query: { startDate, endDate }, text: `${dayText(startDate)} to ${dayText(endDate)}` }
}

export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
