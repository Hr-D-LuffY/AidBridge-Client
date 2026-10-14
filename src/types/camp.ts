import type { PaginationParams } from './api'
import type { GeoPoint } from './user'

// A camp as a victim sees it: the NGO's name only, no volunteers. GET /camps/:id.
export type CampSummary = {
  id: string
  name: string
  ngo: { name: string | null }
  address: string | null
  location: GeoPoint
  capacity: number
  currentOccupancy: number
  availableSpots: number
}

// GET /camps/nearby: the same, with the distance from the point asked about.
export type NearbyCamp = CampSummary & {
  distanceMeters: number
}

export type NearbyCampParams = PaginationParams & {
  lng: number
  lat: number
  // metres, 50 000 at most
  radius?: number
}
