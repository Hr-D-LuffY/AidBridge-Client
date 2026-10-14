'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MyCampsParams, NearbyCampParams } from '@/types'
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

// The volunteer's own camps with their stock. Stock changes as hand-outs happen (this volunteer's and
// other volunteers'), so `pollMs` from usePolling() keeps it fresh; the hand-out form reads it too and
// passes `enabled` so nothing is fetched while the form is closed.
export function useMyCampsQuery(
  params: MyCampsParams,
  { pollMs = false, enabled = true }: { pollMs?: number | false; enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: campKeys.mine(params),
    queryFn: ({ signal }) => campApi.mine(params, signal),
    refetchInterval: pollMs,
    enabled,
  })
}
