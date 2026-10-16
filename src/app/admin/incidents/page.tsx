import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { IncidentsView } from '@/features/incident/components/incidents-view'
import { incidentKeys } from '@/features/incident/incident.keys'
import { parseIncidentParams, toIncidentQuery } from '@/features/incident/incident.params'
import { getIncidentPage } from '@/features/incident/incident.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Incidents' }

type PageProps = {
  searchParams: Promise<{ page?: string; status?: string; priority?: string; type?: string }>
}

// The first page of incidents is fetched here and handed to the client view through the query cache, so
// the first paint already has it. The filters are in the URL, so the page reads them to prefetch the same
// list the view will ask for.
export default async function IncidentsPage({ searchParams }: PageProps) {
  const query = toIncidentQuery(parseIncidentParams(await searchParams))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: incidentKeys.list(query),
    queryFn: () => getIncidentPage(query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncidentsView />
    </HydrationBoundary>
  )
}
