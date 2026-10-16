import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { campKeys } from '@/features/camp/camp.keys'
import { toManagedCampsQuery } from '@/features/camp/camp.params'
import { getManagedCamps } from '@/features/camp/camp.server'
import { NgoCampsView } from '@/features/camp/components/ngo-camps-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Camps' }

type PageProps = { searchParams: Promise<{ page?: string }> }

// The same page the NGOs use, over every camp (GET /camps answers an admin with all of them). The first
// page is fetched here and handed to the client view through the query cache.
export default async function AdminCampsPage({ searchParams }: PageProps) {
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
      <NgoCampsView admin />
    </HydrationBoundary>
  )
}
