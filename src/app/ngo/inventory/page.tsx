import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { InventoryView } from '@/features/inventory/components/inventory-view'
import { inventoryKeys } from '@/features/inventory/inventory.keys'
import { parseInventoryParams, toInventoryQuery } from '@/features/inventory/inventory.params'
import { getInventoryPage } from '@/features/inventory/inventory.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Inventory' }

type PageProps = {
  searchParams: Promise<{ page?: string; camp?: string; category?: string; low?: string }>
}

// The first page of stock is fetched here and handed to the client view through the query cache, so the
// first paint already has it. The filters are in the URL, so the page reads them to prefetch the same
// list the view will ask for.
export default async function InventoryPage({ searchParams }: PageProps) {
  const query = toInventoryQuery(parseInventoryParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: inventoryKeys.list(query),
    queryFn: () => getInventoryPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InventoryView />
    </HydrationBoundary>
  )
}
