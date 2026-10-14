import type { Metadata } from 'next'
import { NearbyView } from '@/features/sos/components/nearby-view'

export const metadata: Metadata = { title: 'Requests near you' }

// The requests depend on where the volunteer is, which only the browser knows, so the view fetches them
// itself once it has a position.
export default function NearbyRequestsPage() {
  return <NearbyView />
}
