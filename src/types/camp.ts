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

// A camp as its NGO (or an admin) sees it: GET /camps, and what every camp write answers with.
export type ManagedCamp = {
  id: string
  ngo: { id: string; name: string }
  name: string
  location: GeoPoint
  address: string | null
  capacity: number
  currentOccupancy: number
  availableSpots: number
  isActive: boolean
  assignedVolunteers: { id: string; name: string; phone: string | null }[]
  createdAt: string
  updatedAt: string
}

export type CampListParams = PaginationParams & {
  isActive?: boolean
}

// POST /camps. The owner is the caller; any other field (ngo, assignedVolunteers) is a 400.
export type CreateCampPayload = {
  name: string
  // [lng, lat]
  coordinates: [number, number]
  address?: string
  capacity: number
  currentOccupancy?: number
  isActive?: boolean
}

// PUT /camps/:id takes only what changed; an empty body or an unknown field is a 400. A capacity below
// the people already in the camp is a 409.
export type UpdateCampPayload = Partial<CreateCampPayload>
