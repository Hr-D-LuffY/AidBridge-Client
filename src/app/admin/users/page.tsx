import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { UsersView } from '@/features/user/components/users-view'
import { userKeys } from '@/features/user/user.keys'
import { parseUsersParams, toUsersQuery } from '@/features/user/user.params'
import { getUserPage } from '@/features/user/user.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Users' }

type PageProps = { searchParams: Promise<{ page?: string; role?: string; blocked?: string }> }

// The first page of accounts is fetched here and handed to the client view through the query cache, so the
// first paint already has it. The role filter is in the URL, so the page reads it to prefetch the same list.
export default async function UsersPage({ searchParams }: PageProps) {
  const query = toUsersQuery(parseUsersParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: userKeys.list(query),
    queryFn: () => getUserPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersView />
    </HydrationBoundary>
  )
}
