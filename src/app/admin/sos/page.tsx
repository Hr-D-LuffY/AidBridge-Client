import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { AdminSosListView } from '@/features/sos/components/admin-sos-list-view'
import { sosKeys } from '@/features/sos/sos.keys'
import { parseSosParams, toSosQuery } from '@/features/sos/sos.params'
import { getSosPage } from '@/features/sos/sos.server'
import { ADMIN_PAGE_SIZE } from '@/lib/constants'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'SOS requests' }

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

// The first page of requests is fetched here and handed to the client view through the query cache, so the
// first paint already has it. The filters are in the URL, so the page reads them to prefetch the same list.
export default async function AdminSosPage({ searchParams }: PageProps) {
  const query = toSosQuery(parseSosParams(await searchParams), ADMIN_PAGE_SIZE)

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: sosKeys.list(query),
    queryFn: () => getSosPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminSosListView />
    </HydrationBoundary>
  )
}
