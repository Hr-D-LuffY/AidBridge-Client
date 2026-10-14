'use client'

import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import type { LatLng } from '@/lib/geo'

// 'denied': the user (or the browser) refused. 'unavailable': no GPS fix, a timeout, or a browser
// without geolocation. Both leave the caller to offer typing an address or placing a pin.
export type GeolocationStatus = 'idle' | 'locating' | 'success' | 'denied' | 'unavailable'

type GeolocationState = {
  status: GeolocationStatus
  position: LatLng | null
  // How far off the fix may be, in metres.
  accuracyMeters: number | null
}

const IDLE: GeolocationState = { status: 'idle', position: null, accuracyMeters: null }

const LOCATE_TIMEOUT_MS = 10_000
// A fix from the last minute is good enough and answers at once (a weak connection is slow).
const MAX_FIX_AGE_MS = 60_000

export const GEOLOCATION_MESSAGE: Record<'denied' | 'unavailable', string> = {
  denied: 'Location access was blocked. Type your address or place a pin on the map instead.',
  unavailable: 'We could not find your position. Type your address or place a pin on the map.',
}

function requestPosition(setState: Dispatch<SetStateAction<GeolocationState>>) {
  if (!('geolocation' in navigator)) {
    setState({ ...IDLE, status: 'unavailable' })
    return
  }
  setState((current) => ({ ...current, status: 'locating' }))
  navigator.geolocation.getCurrentPosition(
    ({ coords }) =>
      setState({
        status: 'success',
        position: { lat: coords.latitude, lng: coords.longitude },
        accuracyMeters: coords.accuracy,
      }),
    (error) =>
      setState({
        ...IDLE,
        status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
      }),
    { enableHighAccuracy: true, timeout: LOCATE_TIMEOUT_MS, maximumAge: MAX_FIX_AGE_MS },
  )
}

// The browser's position. It is asked for when `request()` is called (from a button the user pressed)
// or, with `autoRequest`, once when the screen opens: only for a screen that says why it needs the
// position right at the top, like the SOS form. Coordinates come back as { lat, lng }; lib/geo.ts
// converts to the API order.
export function useGeolocation({ autoRequest = false }: { autoRequest?: boolean } = {}) {
  const [state, setState] = useState<GeolocationState>(IDLE)

  useEffect(() => {
    if (autoRequest) requestPosition(setState)
  }, [autoRequest])

  return {
    ...state,
    isLocating: state.status === 'locating',
    message:
      state.status === 'denied' || state.status === 'unavailable'
        ? GEOLOCATION_MESSAGE[state.status]
        : null,
    request: () => requestPosition(setState),
  }
}
