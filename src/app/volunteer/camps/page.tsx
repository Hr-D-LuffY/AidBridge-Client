import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { campKeys } from '@/features/camp/camp.keys'
import { MY_CAMPS_PARAMS } from '@/features/camp/camp.params'
import { getMyCamps } from '@/features/camp/camp.server'
import { MyCampsView } from '@/features/camp/components/my-camps-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Relief camps' }

// The camps and their stock are fetched here and handed to the client view through the query cache, so
// the first paint already has them. The hand-out form reads the same cache.
export default async function MyCampsPage() {
  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: campKeys.mine(MY_CAMPS_PARAMS),
    queryFn: () => getMyCamps(MY_CAMPS_PARAMS),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyCampsView />
    </HydrationBoundary>
  )
}
