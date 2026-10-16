import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IncidentDetailView } from '@/features/incident/components/incident-detail-view'
import { incidentKeys } from '@/features/incident/incident.keys'
import { INCIDENT_LOOKUP_PARAMS } from '@/features/incident/incident.params'
import { getIncidentPage } from '@/features/incident/incident.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Incident' }

type PageProps = { params: Promise<{ id: string }> }

// There is no GET /incidents/:id, so the page reads the newest 100 incidents and picks this one out. An id
// that is not among them (unknown, deleted or older) shows the area's "not found" page.
export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params

  const queryClient = makeQueryClient()
  const page = await queryClient.fetchQuery({
    queryKey: incidentKeys.list(INCIDENT_LOOKUP_PARAMS),
    queryFn: () => getIncidentPage(INCIDENT_LOOKUP_PARAMS),
  })
  if (!page.items.some((incident) => incident.id === id)) notFound()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncidentDetailView id={id} />
    </HydrationBoundary>
  )
}
