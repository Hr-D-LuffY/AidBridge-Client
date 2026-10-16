import type { InventoryListParams } from '@/types'

// One key factory for every stock query. Plain module: the server pages and the camp queries import it too.
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: InventoryListParams) => [...inventoryKeys.lists(), params] as const,
  // The items at or below their low-stock threshold (the alerts).
  alerts: (params: { page?: number; limit?: number }) =>
    [...inventoryKeys.all, 'alerts', params] as const,
}
