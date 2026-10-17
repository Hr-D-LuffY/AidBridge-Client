import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IncidentDetailView } from '@/features/incident/components/incident-detail-view'
import { incidentKeys } from '@/features/incident/incident.keys'
import { getIncident } from '@/features/incident/incident.server'
import { isApiError } from '@/lib/api/errors'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Incident' }

type PageProps = { params: Promise<{ id: string }> }

// One incident, read with GET /incidents/:id. A malformed, unknown or deleted id shows the area's "not
// found" page.
export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params

  const queryClient = makeQueryClient()
  try {
    await queryClient.fetchQuery({
      queryKey: incidentKeys.detail(id),
      queryFn: () => getIncident(id),
    })
  } catch (error) {
    if (isApiError(error) && [400, 404].includes(error.status)) notFound()
    throw error
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncidentDetailView id={id} />
    </HydrationBoundary>
  )
}
