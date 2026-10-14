'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { NearbyCampParams } from '@/types'
import { campApi } from './camp.api'
import { campKeys } from './camp.keys'

// Camps near a point. `params` is null until the position is known, and the query waits for it.
export function useNearbyCampsQuery(params: NearbyCampParams | null) {
  return useQuery({
    queryKey: campKeys.nearby(params ?? { lng: 0, lat: 0 }),
    queryFn: ({ signal }) => campApi.nearby(params as NearbyCampParams, signal),
    enabled: params !== null,
    // Keep the old camps on screen while a wider radius loads.
    placeholderData: keepPreviousData,
  })
}
