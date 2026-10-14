import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SosDetailView } from '@/features/sos/components/sos-detail-view'
import { sosKeys } from '@/features/sos/sos.keys'
import { getSos } from '@/features/sos/sos.server'
import { isApiError } from '@/lib/api/errors'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'SOS request' }

type PageProps = { params: Promise<{ id: string }> }

// A request that does not exist, is not yours (403) or has a malformed id (400) all show the area's
// "not found" page, so ids cannot be probed.
export default async function SosDetailPage({ params }: PageProps) {
  const { id } = await params

  const queryClient = makeQueryClient()
  try {
    await queryClient.fetchQuery({ queryKey: sosKeys.detail(id), queryFn: () => getSos(id) })
  } catch (error) {
    if (isApiError(error) && [400, 403, 404].includes(error.status)) notFound()
    throw error
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SosDetailView id={id} />
    </HydrationBoundary>
  )
}
