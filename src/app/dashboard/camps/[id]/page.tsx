import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCamp } from '@/features/camp/camp.server'
import { CampDetailView } from '@/features/camp/components/camp-detail-view'
import { isApiError } from '@/lib/api/errors'

export const metadata: Metadata = { title: 'Relief camp' }

type PageProps = { params: Promise<{ id: string }> }

// A camp that does not exist, is closed (404) or has a malformed id (400) shows the area's "not found"
// page, the same as a request that is not yours.
export default async function CampPage({ params }: PageProps) {
  const { id } = await params

  try {
    return <CampDetailView camp={await getCamp(id)} />
  } catch (error) {
    if (isApiError(error) && [400, 403, 404].includes(error.status)) notFound()
    throw error
  }
}
