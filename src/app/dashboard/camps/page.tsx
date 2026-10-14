import type { Metadata } from 'next'
import { NearbyCampsView } from '@/features/camp/components/nearby-camps-view'

export const metadata: Metadata = { title: 'Relief camps' }

// The camps depend on where the visitor is, which only the browser knows, so the view fetches them
// itself once it has a position.
export default function NearbyCampsPage() {
  return <NearbyCampsView />
}
