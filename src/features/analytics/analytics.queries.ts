'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from './analytics.api'
import { analyticsKeys } from './analytics.keys'

// What is open right now. Requests are raised and rescued all the time, so `pollMs` from usePolling()
// asks again every so often while the tab is visible.
export function useLiveMapQuery(pollMs: number | false = false) {
  return useQuery({
    queryKey: analyticsKeys.liveMap(),
    queryFn: ({ signal }) => analyticsApi.liveMap(signal),
    refetchInterval: pollMs,
  })
}
