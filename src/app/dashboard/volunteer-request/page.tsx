import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { VolunteerRequestView } from '@/features/volunteer-request/components/volunteer-request-view'
import { volunteerRequestKeys } from '@/features/volunteer-request/volunteer-request.keys'
import { getMyVolunteerRequests } from '@/features/volunteer-request/volunteer-request.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Become a volunteer' }

export default async function VolunteerRequestPage() {
  const queryClient = makeQueryClient()
  // A failure is not fatal: the client view fetches again and shows its own error state.
  await queryClient.prefetchQuery({
    queryKey: volunteerRequestKeys.mine(),
    queryFn: getMyVolunteerRequests,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VolunteerRequestView />
    </HydrationBoundary>
  )
}
