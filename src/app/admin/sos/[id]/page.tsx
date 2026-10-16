import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminSosDetailView } from '@/features/sos/components/admin-sos-detail-view'
import { sosKeys } from '@/features/sos/sos.keys'
import { getSos } from '@/features/sos/sos.server'
import { isApiError } from '@/lib/api/errors'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'SOS request' }

type PageProps = { params: Promise<{ id: string }> }

// An unknown request or a malformed id shows the area's "not found" page.
export default async function AdminSosDetailPage({ params }: PageProps) {
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
      <AdminSosDetailView id={id} />
    </HydrationBoundary>
  )
}
