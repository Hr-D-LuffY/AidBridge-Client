'use client'

import L from 'leaflet'
import { useEffect } from 'react'
import { Circle, MapContainer, Marker, useMap } from 'react-leaflet'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, type LatLng, LOCATED_MAP_ZOOM } from '@/lib/geo'
import { cn } from '@/lib/utils'
import {
  ClickToPlace,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MapControls,
  ResizeWatcher,
  ThemedTiles,
} from './map-base'

// The marker: a round "profile picture" style badge with a person in it and a short pointer. It takes
// its colours from the theme (see .map-pin in globals.css); the pointer's tip is the exact spot.
const PIN_ICON = L.divIcon({
  className: 'map-pin',
  html: `<svg viewBox="0 0 40 52" width="38" height="50" aria-hidden="true">
    <ellipse cx="20" cy="49" rx="5.5" ry="1.8" fill="var(--foreground)" opacity="0.3"/>
    <path d="M14 33 20 46.5 26 33Z" fill="currentColor" stroke="var(--background)" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="20" cy="19" r="17" fill="currentColor" stroke="var(--background)" stroke-width="3"/>
    <circle cx="20" cy="13.5" r="5" fill="var(--background)"/>
    <path d="M10.8 30c0-6.2 4-9.6 9.2-9.6s9.2 3.4 9.2 9.6z" fill="var(--background)"/>
  </svg>`,
  iconSize: [38, 50],
  iconAnchor: [19, 47],
})

// Moves the view to a new position (the GPS fix arriving, or the location button pressed again).
function Follow({ position }: { position: LatLng | null }) {
  const map = useMap()
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!position) return
    const zoom = Math.max(map.getZoom(), LOCATED_MAP_ZOOM)
    if (reduceMotion) map.setView(position, zoom, { animate: false })
    else map.flyTo(position, zoom, { duration: 0.8 })
  }, [position, map, reduceMotion])

  return null
}

type LocationMapCanvasProps = {
  position: LatLng | null
  // How far off the GPS fix may be; drawn as a soft circle. Not shown for a pin the user placed.
  accuracyMeters?: number | null
  // Tapping the map or dragging the pin.
  onChange?: (position: LatLng) => void
  // Adds the round location button.
  onLocate?: () => void
  // True while the browser is finding the position (the button shows it).
  locating?: boolean
  // Show the place only: no tapping to move the pin, no dragging, no location button.
  readOnly?: boolean
  // Zoom with the mouse wheel. Off by default so scrolling the page past a small map does not zoom it;
  // turn it on for a map that fills a modal.
  scrollZoom?: boolean
  className?: string
}

// The Leaflet map for choosing where help is needed. Browser-only, so use `LocationMap`, which loads
// this file lazily. Tap anywhere to move the pin, or drag it.
export function LocationMapCanvas({
  position,
  accuracyMeters,
  onChange,
  onLocate,
  locating,
  readOnly = false,
  scrollZoom = false,
  className,
}: LocationMapCanvasProps) {
  return (
    // `isolate` keeps Leaflet's high z-index layers below the sticky header and the dialogs.
    <div className={cn('relative isolate overflow-hidden rounded-2xl border', className)}>
      <MapContainer
        center={position ?? DEFAULT_MAP_CENTER}
        zoom={position ? LOCATED_MAP_ZOOM : DEFAULT_MAP_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={scrollZoom}
        className="size-full"
      >
        <ThemedTiles />
        {!readOnly && onChange && <ClickToPlace onChange={onChange} />}
        <ResizeWatcher />
        <Follow position={position} />
        <MapControls onLocate={readOnly ? undefined : onLocate} locating={locating} />
        {position && (
          <>
            {accuracyMeters ? (
              <Circle
                center={position}
                radius={accuracyMeters}
                pathOptions={{ className: 'accuracy-circle', weight: 1, fillOpacity: 0.12 }}
              />
            ) : null}
            <Marker
              position={position}
              icon={PIN_ICON}
              draggable={!readOnly && Boolean(onChange)}
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = (event.target as L.Marker).getLatLng()
                  onChange?.({ lat, lng })
                },
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}
