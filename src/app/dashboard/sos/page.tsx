import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { SosListView } from '@/features/sos/components/sos-list-view'
import { sosKeys } from '@/features/sos/sos.keys'
import { SOS_FETCH_PARAMS } from '@/features/sos/sos.params'
import { getSosPage } from '@/features/sos/sos.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'My requests' }

// The whole list is fetched here and handed to the client view through the query cache, so the first
// paint already has the cards. Search, sort and filters (all in the URL) are applied in the browser.
export default async function MySosPage() {
  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: sosKeys.list(SOS_FETCH_PARAMS),
    queryFn: () => getSosPage(SOS_FETCH_PARAMS),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SosListView />
    </HydrationBoundary>
  )
}
