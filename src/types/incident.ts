import type { PaginationParams } from './api'
import type { DisasterType, IncidentStatus, Priority } from './enums'
import type { GeoPoint } from './user'

// A disaster event an admin tracks, with the requests linked to it. `totalRescued` is counted live by the
// backend from the linked requests that are rescued. The list of linked ids is only sent right after a
// link or unlink call (`sosRequests`).
export type Incident = {
  id: string
  title: string
  disasterType: DisasterType
  location: GeoPoint
  address: string | null
  description: string | null
  startDate: string
  endDate: string | null
  status: IncidentStatus
  priority: Priority
  createdBy: { id: string; name: string }
  linkedRequests: number
  totalRescued: number
  sosRequests?: string[]
  createdAt: string
  updatedAt: string
}

export type IncidentListParams = PaginationParams & {
  status?: IncidentStatus
  priority?: Priority
  disasterType?: DisasterType
}

// POST /incidents. Status, priority, links and the end date are not set on creation.
export type CreateIncidentPayload = {
  title: string
  disasterType: DisasterType
  // [lng, lat]
  coordinates: [number, number]
  address?: string
  description?: string
  // yyyy-mm-dd or a full ISO date-time
  startDate: string
}

// PUT /incidents/:id takes only what changed. `status: 'resolved'` stamps the end date; back to `active`
// clears it. Priority and the links have their own routes.
export type UpdateIncidentPayload = Partial<CreateIncidentPayload> & {
  endDate?: string
  status?: IncidentStatus
}
