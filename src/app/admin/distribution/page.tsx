import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { DistributionHistoryView } from '@/features/distribution/components/distribution-history-view'
import { distributionKeys } from '@/features/distribution/distribution.keys'
import {
  parseDistributionParams,
  toDistributionQuery,
} from '@/features/distribution/distribution.params'
import { getDistributionPage } from '@/features/distribution/distribution.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Distribution' }

type PageProps = {
  searchParams: Promise<{
    page?: string
    camp?: string
    volunteer?: string
    from?: string
    to?: string
  }>
}

// The same page the NGOs use, over every hand-out (GET /distribution answers an admin with all of them).
// The filters are in the URL, so the page reads them to prefetch the same list the view will ask for.
export default async function AdminDistributionPage({ searchParams }: PageProps) {
  const query = toDistributionQuery(parseDistributionParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: distributionKeys.list(query),
    queryFn: () => getDistributionPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DistributionHistoryView admin />
    </HydrationBoundary>
  )
}
