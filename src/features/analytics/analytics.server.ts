import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Analytics, AnalyticsQuery, IncidentSummary, Report } from '@/types'

// The admin dashboard numbers (GET /analytics), for the range in the URL.
export function getAnalytics(query: AnalyticsQuery): Promise<Analytics> {
  return serverApi.get<Analytics>('/analytics', query)
}

// The report totals (GET /analytics/reports), for the same range.
export function getReport(query: AnalyticsQuery): Promise<Report> {
  return serverApi.get<Report>('/analytics/reports', query)
}

// Incidents: how many, how many active, how many of those are critical (GET /analytics/admin-summary).
export function getIncidentSummary(): Promise<IncidentSummary> {
  return serverApi.get<IncidentSummary>('/analytics/admin-summary')
}
