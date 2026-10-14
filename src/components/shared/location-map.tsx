'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Leaflet needs `window`, so the map loads in the browser only, after the page is already usable.
// Give it a height through `className` (e.g. h-72): a map with no height draws nothing.
export const LocationMap = dynamic(
  () => import('./location-map-canvas').then((module) => module.LocationMapCanvas),
  {
    ssr: false,
    loading: () => <Skeleton className="size-full min-h-48 rounded-2xl" />,
  },
)
