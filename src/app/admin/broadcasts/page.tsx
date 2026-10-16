import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { BroadcastsView } from '@/features/notification/components/broadcasts-view'
import { toBroadcastHistoryQuery } from '@/features/notification/notification.broadcast'
import { notificationKeys } from '@/features/notification/notification.keys'
import { getNotificationPage } from '@/features/notification/notification.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Broadcasts' }

type PageProps = { searchParams: Promise<{ page?: string }> }

// The first page of the history is fetched here and handed to the client view through the query cache, so
// the first paint already has it. The page is in the URL, so the page reads it to prefetch the same list.
export default async function BroadcastsPage({ searchParams }: PageProps) {
  const query = toBroadcastHistoryQuery((await searchParams).page)

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: notificationKeys.list(query),
    queryFn: () => getNotificationPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BroadcastsView />
    </HydrationBoundary>
  )
}
