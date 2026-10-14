'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

// The `refetchInterval` for a query that has to look fresh without websockets (chat, the
// notification bell): the interval while the tab is visible and `enabled`, otherwise false so a
// background tab or a finished conversation sends no requests.
//
//   useQuery({ queryKey, queryFn, refetchInterval: usePolling(POLL_INTERVAL_MS.chat, !isClosed) })
export function usePolling(intervalMs: number, enabled = true): number | false {
  const visible = useSyncExternalStore(
    subscribe,
    () => document.visibilityState === 'visible',
    () => true,
  )
  return enabled && visible ? intervalMs : false
}
