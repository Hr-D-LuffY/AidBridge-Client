'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type ReactNode, useEffect, useRef } from 'react'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, type LatLng } from '@/lib/geo'
import { cn } from '@/lib/utils'
import { ClickToPlace, MAP_MAX_ZOOM, MAP_MIN_ZOOM, MapControls, ResizeWatcher } from './map-base'
import { PlaceCard, type PlaceRow, type PlaceStatus } from './place-card'

// 'open' is green, 'full' amber. They match the legend and the dot in the hover card.
export type PlaceTone = 'open' | 'full'

export type MapPlace = {
  id: string
  name: string
  position: LatLng
  tone?: PlaceTone
  // The card that opens on hover or tap: label and value rows, and a last row with a coloured dot.
  rows?: readonly PlaceRow[]
  status?: PlaceStatus
}

// One line of the legend: a coloured dot and what it stands for.
export type MapLegendItem = { label: string; tone: 'you' | PlaceTone }

type PinSize = { width: number; height: number }
const PIN_SIZE: PinSize = { width: 38, height: 50 }
const PIN_SIZE_SELECTED: PinSize = { width: 48, height: 63 }

const iconCache = new Map<string, L.DivIcon>()

// The marker for a place: a round badge with a house in it and a short pointer, like the location pin.
// The pointer's tip is the exact spot. Icons are built once per tone and size, not on every render.
function getPlaceIcon(tone: PlaceTone, selected: boolean) {
  const key = `${tone}-${selected}`
  const cached = iconCache.get(key)
  if (cached) return cached

  const { width, height } = selected ? PIN_SIZE_SELECTED : PIN_SIZE
  const icon = L.divIcon({
    className: `place-pin place-pin-${tone}`,
    html: `<svg viewBox="0 0 40 52" width="${width}" height="${height}" aria-hidden="true">
      <ellipse cx="20" cy="49" rx="5.5" ry="1.8" fill="#000" opacity="0.35"/>
      <path d="M14 33 20 46.5 26 33Z" fill="currentColor" stroke="var(--cm-bg)" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="20" cy="19" r="17" fill="currentColor" stroke="var(--cm-bg)" stroke-width="3"/>
      <path d="M20 9.5 30 18.5H27.2V28H22.6V22H17.4V28H12.8V18.5H10Z" fill="var(--cm-bg)" stroke="var(--cm-bg)" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height * 0.94],
  })
  iconCache.set(key, icon)
  return icon
}

const toTuple = ({ lat, lng }: LatLng): [number, number] => [lat, lng]
const coordinateKey = ({ lat, lng }: LatLng) => `${lat.toFixed(3)},${lng.toFixed(3)}`

// Frames the view. With a search radius it shows exactly that circle around "you", so choosing 10 km
// or 50 km zooms the map in or out even when the same camps are found. Without one it shows "you"
// and every place. It moves only when "you", the radius or the set of points really changes, not on
// every render, so picking a camp does not zoom the map away.
function FitView({
  you,
  places,
  radiusMeters,
}: {
  you: LatLng | null
  places: readonly MapPlace[]
  radiusMeters: number | null | undefined
}) {
  const map = useMap()
  const reduceMotion = usePrefersReducedMotion()
  const lastKey = useRef('')

  useEffect(() => {
    const animate = !reduceMotion

    if (you && radiusMeters) {
      const key = `${coordinateKey(you)}|${radiusMeters}`
      if (key === lastKey.current) return
      lastKey.current = key
      // The square around the circle: `toBounds` takes the side length, so twice the radius.
      const bounds = L.latLng(toTuple(you)).toBounds(radiusMeters * 2)
      map.fitBounds(bounds, { padding: [16, 16], maxZoom: 15, animate })
      return
    }

    const points = [...(you ? [you] : []), ...places.map((place) => place.position)]
    if (points.length === 0) return
    const key = points.map(coordinateKey).join('|')
    if (key === lastKey.current) return
    lastKey.current = key
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: false })
      return
    }
    map.fitBounds(points.map(toTuple), { padding: [40, 40], maxZoom: 15, animate })
  }, [you, places, radiusMeters, map, reduceMotion])

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

// The same buttons as every other map in the app (zoom in and out, and the round "my location" button,
// bottom right; the map credit, bottom left). The location button asks for a fresh position and centres
// the map on "you".
function Controls({
  you,
  onLocate,
  locating,
}: {
  you: LatLng | null
  onLocate: (() => void) | undefined
  locating: boolean | undefined
}) {
  const map = useMap()
  return (
    <MapControls
      locating={locating}
      onLocate={
        onLocate &&
        (() => {
          onLocate()
          if (you) map.setView(you, Math.max(map.getZoom(), 14), { animate: true })
        })
      }
    />
  )
}

type PlacesMapCanvasProps = {
  you: LatLng | null
  places: readonly MapPlace[]
  // What the colours mean, shown as a small card at the bottom left.
  legend?: readonly MapLegendItem[]
  selectedId?: string | null
  // A place was picked (a tap on a touch screen): the list highlights it.
  onSelect?: (id: string) => void
  // The place's icon was clicked: open its own page. On a touch screen the first tap only shows the
  // card, and a second tap on the same place opens it.
  onOpen?: (id: string) => void
  // The search radius around "you": drawn as a dashed circle, and the map is framed to it.
  radiusMeters?: number | null
  // Tapping empty map sets where "you" are (used when GPS is blocked).
  onPickYou?: (position: LatLng) => void
  // Adds the round location button, and "locating" shows it is working.
  onLocate?: () => void
  locating?: boolean
  // Shown in the middle of the map when nothing was found.
  emptyNote?: ReactNode
  // The bar above the map (radius, refresh, counts), inside the same frame.
  header?: ReactNode
  // Zoom with the mouse wheel. On by default: this map is the page's main content.
  scrollZoom?: boolean
  className?: string
}

// The map of "you are here" and the places around you (relief camps), drawn the way the first AidBridge
// was: a dark map in a frame with an optional control bar on top, house badges that open a dark info card
// on hover (and grow a little), a "YOU ARE HERE" tag, a legend and the app's usual map buttons. The colours are
// fixed on purpose (the `.classic-map` palette in globals.css), so it looks the same in the light and
// the dark theme. Browser-only: use `PlacesMap`.
export function PlacesMapCanvas({
  you,
  places,
  legend,
  selectedId,
  onSelect,
  onOpen,
  radiusMeters,
  onPickYou,
  onLocate,
  locating,
  emptyNote,
  header,
  scrollZoom = true,
  className,
}: PlacesMapCanvasProps) {
  // No hover on a touch screen, so there the first tap shows the card and the second one opens it.
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  return (
    <div className={cn('classic-map isolate flex flex-col overflow-hidden rounded-2xl', className)}>
      {header}
      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={you ?? DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          minZoom={MAP_MIN_ZOOM}
          maxZoom={MAP_MAX_ZOOM}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={scrollZoom}
          className="size-full"
        >
          {/* The free OpenStreetMap tiles, always drawn dark. The credit is behind the (i) button. */}
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={MAP_MAX_ZOOM}
            className="map-tiles-dark"
          />
          <ResizeWatcher />
          <FitView you={you} places={places} radiusMeters={radiusMeters} />
          <PanToSelected places={places} selectedId={selectedId} />
          {onPickYou && <ClickToPlace onChange={onPickYou} />}

          {you && radiusMeters ? (
            <Circle
              center={you}
              radius={radiusMeters}
              pathOptions={{
                interactive: false,
                className: 'classic-radius',
                weight: 1.5,
                dashArray: '6 6',
                fillOpacity: 0.05,
              }}
            />
          ) : null}

          {places.map((place) => {
            const selected = place.id === selectedId
            return (
              <Marker
                key={place.id}
                position={place.position}
                icon={getPlaceIcon(place.tone ?? 'open', selected)}
                zIndexOffset={selected ? 1000 : 0}
                eventHandlers={{
                  click: (event) => {
                    if (!onOpen || (!hasHover && !selected)) {
                      onSelect?.(place.id)
                      if (!hasHover) (event.target as L.Marker).openTooltip()
                      return
                    }
                    onOpen(place.id)
                  },
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -(selected ? PIN_SIZE_SELECTED.height : PIN_SIZE.height) + 6]}
                  className="classic-tip"
                >
                  <PlaceCard
                    rows={place.rows ?? [{ label: 'Place', value: place.name }]}
                    status={place.status}
                    hint={
                      onOpen
                        ? hasHover
                          ? 'Click for full details →'
                          : 'Tap again for full details →'
                        : undefined
                    }
                  />
                </Tooltip>
              </Marker>
            )
          })}

          {you && (
            <CircleMarker center={you} radius={13} pathOptions={{ className: 'classic-you' }}>
              <Tooltip direction="top" offset={[0, -15]} className="classic-you-tip">
                YOU ARE HERE
              </Tooltip>
            </CircleMarker>
          )}

          <Controls you={you} onLocate={onLocate} locating={locating} />
        </MapContainer>

        {legend && legend.length > 0 && (
          <div className="classic-legend">
            <div className="classic-legend__title">Legend</div>
            {legend.map((item) => (
              <div key={item.label} className="classic-legend__row">
                <span
                  aria-hidden="true"
                  className={cn('classic-legend__dot', `classic-legend__dot-${item.tone}`)}
                />
                {item.label}
              </div>
            ))}
          </div>
        )}

        {emptyNote && <div className="classic-empty">{emptyNote}</div>}
      </div>
    </div>
  )
}
