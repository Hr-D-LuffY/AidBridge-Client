import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { campKeys } from '@/features/camp/camp.keys'
import { toManagedCampsQuery } from '@/features/camp/camp.params'
import { getManagedCamps } from '@/features/camp/camp.server'
import { NgoCampsView } from '@/features/camp/components/ngo-camps-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Camps' }

type PageProps = { searchParams: Promise<{ page?: string }> }

// The first page of camps is fetched here and handed to the client view through the query cache, so the
// first paint already has it. The page is in the URL, so the page reads it to prefetch the same list.
export default async function NgoCampsPage({ searchParams }: PageProps) {
  const query = toManagedCampsQuery((await searchParams).page)

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: campKeys.managed(query),
    queryFn: () => getManagedCamps(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NgoCampsView />
    </HydrationBoundary>
  )
}
