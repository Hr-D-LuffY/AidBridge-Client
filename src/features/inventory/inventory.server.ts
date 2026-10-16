import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { InventoryItem, InventoryListParams, Paginated } from '@/types'

// The NGO's stock (GET /inventory).
export function getInventoryPage(params: InventoryListParams): Promise<Paginated<InventoryItem>> {
  return serverApi.getList<InventoryItem>('/inventory', params)
}

// The items at or below their low-stock threshold, emptiest first (GET /inventory/alerts).
export function getLowStock(params: { page?: number; limit?: number }) {
  return serverApi.getList<InventoryItem>('/inventory/alerts', params)
}
