'use client'

import { useState } from 'react'
import { useGeolocation } from '@/hooks/use-geolocation'
import type { LatLng } from '@/lib/geo'

// 'gps': the browser's fix. 'pin': the user tapped or dragged the pin, which always wins over GPS.
export type LocationSource = 'gps' | 'pin'

// A position the user chooses: asks the browser for it as the screen opens (the SOS form says why)
// and lets the user correct it by placing the pin, so a blocked or weak GPS never stops a request.
// A screen that should wait for a button press (the profile) passes `autoRequest: false`.
export function useLocationField({ autoRequest = true }: { autoRequest?: boolean } = {}) {
  const geo = useGeolocation({ autoRequest })
  const [pin, setPin] = useState<LatLng | null>(null)

  const position = pin ?? geo.position
  const source: LocationSource | null = pin ? 'pin' : geo.position ? 'gps' : null

  return {
    position,
    source,
    status: pin ? ('success' as const) : geo.status,
    accuracyMeters: pin ? null : geo.accuracyMeters,
    message: geo.message,
    setPin,
    // "Refresh": forget the manual pin and ask the browser again.
    locate: () => {
      setPin(null)
      geo.request()
    },
  }
}
