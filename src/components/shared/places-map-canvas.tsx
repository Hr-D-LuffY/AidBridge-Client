'use client'

import { useEffect, useRef } from 'react'
import { CircleMarker, MapContainer, Tooltip, useMap } from 'react-leaflet'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, type LatLng } from '@/lib/geo'
import { cn } from '@/lib/utils'
import {
  ClickToPlace,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MapControls,
  ResizeWatcher,
  ThemedTiles,
} from './map-base'

export type PlaceTone = 'success' | 'warning' | 'info' | 'high' | 'danger' | 'muted'

export type MapPlace = {
  id: string
  name: string
  position: LatLng
  // The colour of its dot, from the theme tokens (see .place-dot-* in globals.css). Default: success.
  tone?: PlaceTone
}

// Shows the whole picture: you and every place around you. It only moves the view when the set of
// points really changes, not on every render, so picking a camp does not zoom the map away.
function FitAll({ you, places }: { you: LatLng | null; places: readonly MapPlace[] }) {
  const map = useMap()
  const reduceMotion = usePrefersReducedMotion()
  const lastKey = useRef('')

  useEffect(() => {
    const points = [...(you ? [you] : []), ...places.map((place) => place.position)]
    if (points.length === 0) return
    const key = points.map(({ lat, lng }) => `${lat.toFixed(3)},${lng.toFixed(3)}`).join('|')
    if (key === lastKey.current) return
    lastKey.current = key
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: false })
      return
    }
    map.fitBounds(
      points.map(({ lat, lng }) => [lat, lng] as [number, number]),
      { padding: [40, 40], maxZoom: 15, animate: !reduceMotion },
    )
  }, [you, places, map, reduceMotion])

  return null
}

// Centres the map on the place picked in the list.
function PanToSelected({
  places,
  selectedId,
}: {
  places: readonly MapPlace[]
  selectedId: string | null | undefined
}) {
  const map = useMap()
  const lastSelected = useRef<string | null | undefined>(null)

  useEffect(() => {
    if (selectedId === lastSelected.current) return
    lastSelected.current = selectedId
    const place = places.find((candidate) => candidate.id === selectedId)
    if (place) map.panTo(place.position)
  }, [places, selectedId, map])

  return null
}

type PlacesMapCanvasProps = {
  you: LatLng | null
  places: readonly MapPlace[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  // Tapping empty map sets where "you" are (used when GPS is blocked).
  onPickYou?: (position: LatLng) => void
  // Adds the round location button, and "locating" shows it is working.
  onLocate?: () => void
  locating?: boolean
  className?: string
}

// A map of "you are here" and the places around you (relief camps). The classes (you-dot, place-dot)
// take their colours from the theme tokens in globals.css. Browser-only: use `PlacesMap`.
export function PlacesMapCanvas({
  you,
  places,
  selectedId,
  onSelect,
  onPickYou,
  onLocate,
  locating,
  className,
}: PlacesMapCanvasProps) {
  return (
    <div className={cn('isolate overflow-hidden rounded-2xl border', className)}>
      <MapContainer
        center={you ?? DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        className="size-full"
      >
        <ThemedTiles />
        <ResizeWatcher />
        <MapControls onLocate={onLocate} locating={locating} />
        <FitAll you={you} places={places} />
        <PanToSelected places={places} selectedId={selectedId} />
        {onPickYou && <ClickToPlace onChange={onPickYou} />}

        {places.map((place) => (
          <CircleMarker
            key={`${place.id}-${place.tone ?? 'success'}`}
            center={place.position}
            radius={place.id === selectedId ? 15 : 11}
            pathOptions={{
              className: `place-dot place-dot-${place.tone ?? 'success'}`,
              weight: place.id === selectedId ? 4 : 2.5,
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect?.(place.id) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              {place.name}
            </Tooltip>
          </CircleMarker>
        ))}

        {you && (
          <CircleMarker
            center={you}
            radius={9}
            pathOptions={{ className: 'you-dot', weight: 3, fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              You are here
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  )
}
