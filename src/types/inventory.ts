import type { PaginationParams } from './api'
import type { ReliefCategory } from './enums'

// One item of stock as its NGO sees it (GET /inventory). `camp` is null while the item sits in the NGO's
// general store.
export type InventoryItem = {
  id: string
  camp: { id: string; name: string; address: string | null; isActive: boolean } | null
  itemName: string
  category: ReliefCategory
  quantity: number
  unit: string
  lowStockThreshold: number
  // Worked out by the backend on every write; never computed in the browser.
  isLow: boolean
  createdAt: string
  updatedAt: string
}

export type InventoryListParams = PaginationParams & {
  camp?: string
  category?: ReliefCategory
  isLow?: boolean
}

// POST /inventory. `isLow` and `ngo` are the backend's to set; sending them is a 400.
export type CreateInventoryPayload = {
  itemName: string
  category: ReliefCategory
  quantity: number
  unit?: string
  lowStockThreshold?: number
  camp?: string | null
}

// PUT /inventory/:id takes only what changed; `camp: null` takes the item out of its camp.
export type UpdateInventoryPayload = Partial<CreateInventoryPayload>
