'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Info, LoaderCircle, LocateFixed, Minus, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useId, useRef, useState } from 'react'
import { TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { LatLng } from '@/lib/geo'
import { cn } from '@/lib/utils'

// Pieces every map in the app shares. Browser-only (Leaflet needs `window`), so maps are loaded
// through the lazy wrappers (location-map.tsx, places-map.tsx), never imported by pages directly.

export const MAP_MIN_ZOOM = 5
export const MAP_MAX_ZOOM = 19

// The standard OpenStreetMap map, as in the app's earlier version: no account and no API key. Its usage
// policy asks for a visible credit (the ⓘ button in MapControls shows it, since the maps turn
// Leaflet's own credit strip off) and light use; a busy launch needs a hosted provider with its own key.
//
// The style only comes in a light version, so the dark theme inverts it (see .map-tiles-dark in
// globals.css).

export function ThemedTiles() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <TileLayer
      key={dark ? 'dark' : 'light'}
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={MAP_MAX_ZOOM}
      className={dark ? 'map-tiles-dark' : undefined}
    />
  )
}

// Redraws the map when its box changes size (a panel sliding in, the window turning), which Leaflet
// does not notice on its own and shows as grey, half-loaded tiles.
export function ResizeWatcher() {
  const map = useMap()

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return null
}

export function ClickToPlace({ onChange }: { onChange: (position: LatLng) => void }) {
  useMapEvents({
    click: (event) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }),
  })
  return null
}

const BUTTON =
  'grid size-11 cursor-pointer place-items-center outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40'

type MapControlsProps = {
  // Gives the map a round "my location" button. Leave out for a map that only shows a place.
  onLocate?: () => void
  // True while the browser is still finding the position.
  locating?: boolean
}

// The map's buttons, drawn with the app's own tokens instead of Leaflet's small grey squares: one stack
// at the bottom right with zoom in, zoom out and, when `onLocate` is given, a round "my location"
// button under them (the crosshair icon every map app uses). All are 44 px, easy to hit with a thumb.
export function MapControls({ onLocate, locating = false }: MapControlsProps) {
  const map = useMap()
  const reduceMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(() => map.getZoom())
  const [creditOpen, setCreditOpen] = useState(false)
  const creditId = useId()

  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  // A tap on a button must not also move the map or drop a pin under it.
  useEffect(() => {
    const element = root.current
    if (!element) return
    L.DomEvent.disableClickPropagation(element)
    L.DomEvent.disableScrollPropagation(element)
  }, [])

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-[1000]">
      <div className="pointer-events-auto absolute right-3 bottom-4 flex flex-col items-center gap-3">
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card text-foreground shadow-md">
          <button
            type="button"
            className={BUTTON}
            disabled={zoom >= MAP_MAX_ZOOM}
            onClick={() => map.zoomIn(1, { animate: !reduceMotion })}
          >
            <Plus aria-hidden="true" className="size-5" />
            <span className="sr-only">Zoom in</span>
          </button>
          <span aria-hidden="true" className="h-px bg-border" />
          <button
            type="button"
            className={BUTTON}
            disabled={zoom <= MAP_MIN_ZOOM}
            onClick={() => map.zoomOut(1, { animate: !reduceMotion })}
          >
            <Minus aria-hidden="true" className="size-5" />
            <span className="sr-only">Zoom out</span>
          </button>
        </div>

        {onLocate && (
          <button
            type="button"
            title="Use my location"
            disabled={locating}
            onClick={onLocate}
            className={cn(BUTTON, 'rounded-full border bg-card text-foreground shadow-md')}
          >
            {locating ? (
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            ) : (
              <LocateFixed aria-hidden="true" className="size-5 text-primary" />
            )}
            <span className="sr-only">
              {locating ? 'Finding your location' : 'Use my location'}
            </span>
          </button>
        )}
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-3 flex flex-col items-start gap-2">
        {creditOpen && (
          <p
            id={creditId}
            className="max-w-60 rounded-xl border bg-card p-3 text-xs text-pretty shadow-md"
          >
            Map data &copy;{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link underline-offset-2 hover:underline"
            >
              OpenStreetMap
            </a>{' '}
            contributors.
          </p>
        )}
        <button
          type="button"
          aria-expanded={creditOpen}
          aria-controls={creditId}
          onClick={() => setCreditOpen((open) => !open)}
          className={cn(
            BUTTON,
            'size-9 rounded-full border bg-card/90 text-muted-foreground shadow-md',
          )}
        >
          <Info aria-hidden="true" className="size-4" />
          <span className="sr-only">Map credits</span>
        </button>
      </div>
    </div>
  )
}
