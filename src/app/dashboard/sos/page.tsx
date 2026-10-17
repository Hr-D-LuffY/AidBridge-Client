import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { SosListView } from '@/features/sos/components/sos-list-view'
import { sosKeys } from '@/features/sos/sos.keys'
import { parseSosParams, SOS_PAGE_SIZE, toSosQuery } from '@/features/sos/sos.params'
import { getSosPage } from '@/features/sos/sos.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'My requests' }

type PageProps = {
  searchParams: Promise<{
    page?: string
    status?: string
    priority?: string
    needs?: string
    q?: string
    from?: string
    to?: string
    sort?: string
  }>
}

// The first page of the list is fetched here and handed to the client view through the query cache, so the
// first paint already has the cards. The filters, search and sort are in the URL, so the page reads them to
// prefetch the same list the view will ask for.
export default async function MySosPage({ searchParams }: PageProps) {
  const query = toSosQuery(parseSosParams(await searchParams), SOS_PAGE_SIZE)

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: sosKeys.list(query),
    queryFn: () => getSosPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SosListView />
    </HydrationBoundary>
  )
}
