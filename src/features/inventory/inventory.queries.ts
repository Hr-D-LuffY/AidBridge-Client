'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campKeys } from '@/features/camp/camp.keys'
import type {
  CreateInventoryPayload,
  InventoryItem,
  InventoryListParams,
  UpdateInventoryPayload,
} from '@/types'
import { inventoryApi } from './inventory.api'
import { inventoryKeys } from './inventory.keys'

// A page of the NGO's stock. The filters and page live in the URL, so a change keeps the old rows on
// screen until the new ones arrive.
export function useInventoryQuery(params: InventoryListParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: ({ signal }) => inventoryApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

// Stock changes what the NGO's camps hold (a volunteer sees it) and what the overview counts as low, and
// a camp's stock is the same data, so everything stock-shaped is read again.
function useRefreshStock() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    queryClient.invalidateQueries({ queryKey: campKeys.mineAll() })
  }
}

// The forms show their own errors, so the global toast is off.
export function useCreateItem() {
  const refresh = useRefreshStock()
  return useMutation({
    mutationFn: (payload: CreateInventoryPayload) => inventoryApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: (item) => {
      toast.success(`${item.itemName} was added to the stock.`)
      refresh()
    },
  })
}

export function useUpdateItem(id: string) {
  const refresh = useRefreshStock()
  return useMutation({
    mutationFn: (payload: UpdateInventoryPayload) => inventoryApi.update(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      toast.success('Item saved.')
      refresh()
    },
  })
}

export function useDeleteItem() {
  const refresh = useRefreshStock()
  return useMutation({
    mutationFn: (item: Pick<InventoryItem, 'id' | 'itemName'>) => inventoryApi.remove(item.id),
    onSuccess: (_result, item) => toast.success(`${item.itemName} was removed from the stock.`),
    onSettled: refresh,
  })
}
