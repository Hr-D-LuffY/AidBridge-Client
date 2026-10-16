import type { Metadata } from 'next'
import { LiveMapView } from '@/features/analytics/components/live-map-view'

export const metadata: Metadata = { title: 'Live map' }

// The map loads in the browser (it asks again every 30 seconds), so there is nothing to prefetch here.
export default function NgoLiveMapPage() {
  return <LiveMapView />
}
