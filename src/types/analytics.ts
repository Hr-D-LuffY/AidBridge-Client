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
