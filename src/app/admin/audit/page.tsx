import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { auditKeys } from '@/features/audit/audit.keys'
import { parseAuditParams, toAuditQuery } from '@/features/audit/audit.params'
import { getAuditPage } from '@/features/audit/audit.server'
import { AuditLogView } from '@/features/audit/components/audit-log-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Audit log' }

type PageProps = {
  searchParams: Promise<{
    page?: string
    actor?: string
    action?: string
    type?: string
    from?: string
    to?: string
  }>
}

// The page of entries is fetched here and handed to the client view through the query cache, so the first
// paint already has it. The filters are in the URL, so the page reads them to prefetch the same list.
export default async function AuditLogPage({ searchParams }: PageProps) {
  const query = toAuditQuery(parseAuditParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => getAuditPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuditLogView />
    </HydrationBoundary>
  )
}
