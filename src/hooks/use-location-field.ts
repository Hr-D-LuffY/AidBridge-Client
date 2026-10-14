'use client'

import { useState } from 'react'
import { useGeolocation } from '@/hooks/use-geolocation'
import type { LatLng } from '@/lib/geo'

// 'gps': the browser's fix. 'pin': the user tapped or dragged the pin, which always wins over GPS.
export type LocationSource = 'gps' | 'pin'

// The position of an SOS: asks the browser for it as the screen opens (the form says why) and lets
// the user correct it by placing the pin, so a blocked or weak GPS never stops a request.
export function useLocationField() {
  const geo = useGeolocation({ autoRequest: true })
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
