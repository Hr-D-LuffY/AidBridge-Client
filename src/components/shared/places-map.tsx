'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Leaflet needs `window`, so the map loads in the browser only. Give it a height through `className`.
export const PlacesMap = dynamic(
  () => import('./places-map-canvas').then((module) => module.PlacesMapCanvas),
  {
    ssr: false,
    loading: () => <Skeleton className="size-full min-h-48 rounded-2xl" />,
  },
)
