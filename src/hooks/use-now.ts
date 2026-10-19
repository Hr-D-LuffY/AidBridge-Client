'use client'

import { useEffect, useState } from 'react'

// The current time in ms, updated every `intervalMs` while `enabled` (a countdown only ticks while there is
// something to count). It starts from the device clock; callers add the server offset themselves.
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!enabled) return
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, enabled])

  return now
}
