import { clientApi } from '@/lib/api/client'
import type {
  CreateInventoryPayload,
  InventoryItem,
  InventoryListParams,
  UpdateInventoryPayload,
} from '@/types'

export const inventoryApi = {
  // The NGO's own stock, low items first.
  list: (params: InventoryListParams, signal?: AbortSignal) =>
    clientApi.getList<InventoryItem>('/inventory', params, signal),
  create: (payload: CreateInventoryPayload) => clientApi.post<InventoryItem>('/inventory', payload),
  // Only what changed. The backend works `isLow` out again whichever of quantity or threshold moved.
  update: (id: string, payload: UpdateInventoryPayload) =>
    clientApi.put<InventoryItem>(`/inventory/${id}`, payload),
  remove: (id: string) => clientApi.delete(`/inventory/${id}`),
}
