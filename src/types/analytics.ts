import type { Priority, ReliefCategory, SosStatus } from './enums'
import type { GeoPoint } from './user'

// GET /analytics/live-map (NGO and admin): what is open right now. No phone numbers anywhere.
export type LiveMapRequest = {
  id: string
  status: SosStatus
  priority: Priority
  needs: ReliefCategory[]
  location: GeoPoint
  address: string | null
  victim: { id: string; name: string }
  assignedVolunteer: { id: string; name: string } | null
  createdAt: string
}

export type LiveMapCamp = {
  id: string
  name: string
  location: GeoPoint
  address: string | null
  capacity: number
  currentOccupancy: number
  availableSpots: number
  ngo: { id: string; name: string }
}

export type LiveMap = {
  requests: LiveMapRequest[]
  camps: LiveMapCamp[]
}

// GET /analytics and GET /analytics/reports (admin): an optional range, either end alone is fine. A bare
// endDate covers that whole day.
export type AnalyticsQuery = {
  startDate?: string
  endDate?: string
}

export type AnalyticsPeriod = {
  startDate: string | null
  endDate: string | null
}

// The `_id` in these rows is a label (a status, a priority, an item name), not a document id.
export type CountRow<T extends string> = { _id: T; count: number }

// GET /analytics. Both "by" lists always hold every status / priority, with 0 for the missing ones.
export type Analytics = {
  period: AnalyticsPeriod
  summary: {
    totalRequests: number
    rescuedCount: number
    pendingCount: number
    // Active volunteer accounts; not limited to the range.
    volunteerCount: number
  }
  requestsByStatus: CountRow<SosStatus>[]
  requestsByPriority: CountRow<Priority>[]
  // Minutes from a request being raised to a volunteer accepting it; 0 when none was accepted.
  avgResponseTime: number
  // Top 10 by completed tasks.
  volunteerActivity: { _id: string; completedTasks: number; name: string }[]
  // Top 20, split by unit.
  distributionByItem: { _id: string; unit: string; totalDistributed: number }[]
}

// GET /analytics/reports. `registeredUsers` follows the range too.
export type Report = {
  period: AnalyticsPeriod
  totalSOSRequests: number
  rescued: number
  pending: number
  registeredUsers: number
}

// GET /analytics/admin-summary: incidents that are not deleted. `critical` counts active ones only.
export type IncidentSummary = {
  total: number
  active: number
  critical: number
}
