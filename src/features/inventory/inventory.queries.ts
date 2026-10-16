'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campKeys } from '@/features/camp/camp.keys'
import type {
  CreateInventoryPayload,
  InventoryItem,
  InventoryListParams,
  Paginated,
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

type StockCache = Paginated<InventoryItem>

// Sets the amount in stock from the row itself. The new amount shows at once and goes back if the server
// refuses (a 409 means a hand-out changed the stock meanwhile, so the number on screen was out of date).
// Whether the item is now low is the backend's to say: `isLow` is left alone until the list is read
// again, which happens right after the answer.
export function useSetQuantity() {
  const queryClient = useQueryClient()
  const refresh = useRefreshStock()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      inventoryApi.update(id, { quantity }),
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() })
      const snapshot = queryClient.getQueriesData<StockCache>({ queryKey: inventoryKeys.lists() })
      queryClient.setQueriesData<StockCache>(
        { queryKey: inventoryKeys.lists() },
        (page) =>
          page && {
            ...page,
            items: page.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
          },
      )
      return { snapshot }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      for (const [key, data] of context.snapshot) queryClient.setQueryData(key, data)
    },
    onSuccess: (item) => toast.success(`${item.itemName}: ${item.quantity} ${item.unit} in stock.`),
    onSettled: refresh,
  })
}
