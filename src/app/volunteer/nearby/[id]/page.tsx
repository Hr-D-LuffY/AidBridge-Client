import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { NearbyDetailView } from '@/features/sos/components/nearby-detail-view'
import { getSosView } from '@/features/sos/sos.server'
import { isApiError } from '@/lib/api/errors'
import { isFullSos } from '@/types'

export const metadata: Metadata = { title: 'Request for help' }

type PageProps = { params: Promise<{ id: string }> }

// A request that does not exist, was taken by someone else meanwhile (403) or has a malformed id (400)
// shows the area's "not found" page, so ids cannot be probed. One that is already this volunteer's
// comes back in the full view, and belongs on the task board instead.
export default async function NearbyRequestPage({ params }: PageProps) {
  const { id } = await params

  let sos: Awaited<ReturnType<typeof getSosView>>
  try {
    sos = await getSosView(id)
  } catch (error) {
    if (isApiError(error) && [400, 403, 404].includes(error.status)) notFound()
    throw error
  }

  if (isFullSos(sos)) redirect('/volunteer/tasks')
  return <NearbyDetailView sos={sos} />
}
