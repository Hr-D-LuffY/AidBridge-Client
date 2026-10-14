import type { PaginationParams } from './api'
import type { ReliefCategory } from './enums'
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

// One item of stock in a camp (GET /camps/my-assigned lists only items that are in stock).
export type StockItem = {
  id: string
  itemName: string
  category: ReliefCategory
  quantity: number
  unit: string
  lowStockThreshold: number
  // Worked out by the backend on every write; never computed in the browser.
  isLow: boolean
}

export type MyCampsParams = PaginationParams

// A camp the volunteer is assigned to, with what they can hand out from it.
export type AssignedCamp = Omit<CampSummary, 'ngo'> & {
  isActive: boolean
  inventory: StockItem[]
}
