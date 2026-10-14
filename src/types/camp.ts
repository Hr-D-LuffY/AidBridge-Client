import type { PaginationParams } from './api'
import type { GeoPoint } from './user'

// GET /camps/nearby: a trimmed view of an active camp (no NGO, no volunteers).
export type NearbyCamp = {
  id: string
  name: string
  address: string | null
  location: GeoPoint
  capacity: number
  currentOccupancy: number
  availableSpots: number
  distanceMeters: number
}

export type NearbyCampParams = PaginationParams & {
  lng: number
  lat: number
  // metres, 50 000 at most
  radius?: number
}
