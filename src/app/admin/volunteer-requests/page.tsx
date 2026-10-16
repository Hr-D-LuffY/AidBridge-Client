import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { ReviewRequestsView } from '@/features/volunteer-request/components/review-requests-view'
import { volunteerRequestKeys } from '@/features/volunteer-request/volunteer-request.keys'
import {
  parseReviewParams,
  toReviewQuery,
} from '@/features/volunteer-request/volunteer-request.params'
import { getVolunteerRequestPage } from '@/features/volunteer-request/volunteer-request.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Volunteer requests' }

type PageProps = { searchParams: Promise<{ page?: string; status?: string }> }

// The first page of the queue is fetched here and handed to the client view through the query cache, so
// the first paint already has it. The filter is in the URL, so the page reads it to prefetch the same list.
export default async function VolunteerRequestsPage({ searchParams }: PageProps) {
  const query = toReviewQuery(parseReviewParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: volunteerRequestKeys.list(query),
    queryFn: () => getVolunteerRequestPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewRequestsView />
    </HydrationBoundary>
  )
}
