import type { Analytics, Report } from '@/types'
import { formatCount, formatMinutes, headline, percentOf } from './analytics.model'

// The figures the report prints for one period, and how it shows how far each one moved against the
// period before. A plain module, so Server and Client Components can both import it.

export type Kind = 'count' | 'percent' | 'minutes'

export type Figures = {
  raised: number | null
  rescued: number | null
  waiting: number | null
  inProgress: number | null
  closed: number | null
  critical: number | null
  rate: number | null
  response: number | null
  accounts: number | null
}

// Worked out from one period's own numbers. A number whose call failed is null and prints as a dash.
export function figuresOf(report: Report | null, analytics: Analytics | null): Figures {
  const numbers = analytics ? headline(analytics) : null
  return {
    raised: report?.totalSOSRequests ?? null,
    rescued: report?.rescued ?? null,
    waiting: report?.pending ?? null,
    inProgress: numbers?.inProgress ?? null,
    closed: numbers?.closed ?? null,
    critical: analytics?.requestsByPriority.find((row) => row._id === 'critical')?.count ?? null,
    rate: report ? percentOf(report.rescued, report.totalSOSRequests) : null,
    response: analytics?.avgResponseTime ?? null,
    accounts: report?.registeredUsers ?? null,
  }
}

export function showValue(value: number | null, kind: Kind): string {
  if (value === null) return '–'
  if (kind === 'percent') return `${value}%`
  if (kind === 'minutes') return formatMinutes(value)
  return formatCount(value)
}

export type Change = { text: string; direction: -1 | 0 | 1 }

// How far a number moved: the difference, and for counts the percent too. A response time reads as faster
// or slower, because a bigger number there is not "more".
export function changeOf(now: number | null, before: number | null, kind: Kind): Change {
  if (now === null || before === null) return { text: '–', direction: 0 }
  const delta = now - before
  if (delta === 0) return { text: 'No change', direction: 0 }
  const direction = delta > 0 ? 1 : -1
  const sign = direction > 0 ? '+' : '−'
  const size = Math.abs(delta)
  if (kind === 'minutes') {
    if (now <= 0 || before <= 0) return { text: '–', direction: 0 }
    return { text: `${formatMinutes(size)} ${delta < 0 ? 'faster' : 'slower'}`, direction }
  }
  if (kind === 'percent') return { text: `${sign}${size} points`, direction }
  const percent = before > 0 ? ` (${sign}${Math.round((size / before) * 100)}%)` : ''
  return { text: `${sign}${formatCount(size)}${percent}`, direction }
}
