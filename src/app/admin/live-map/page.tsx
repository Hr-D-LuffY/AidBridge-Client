import type { Metadata } from 'next'
import { LiveMapView } from '@/features/analytics/components/live-map-view'

export const metadata: Metadata = { title: 'Live map' }

// The same map the NGOs see (the backend lets admin and NGO call it). It loads in the browser and asks
// again every 30 seconds, so there is nothing to prefetch here.
export default function AdminLiveMapPage() {
  return <LiveMapView />
}
