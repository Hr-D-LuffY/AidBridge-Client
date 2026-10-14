import type { PlaceRow, PlaceStatus } from '@/components/shared/place-card'
import type { MapLegendItem, MapPlace } from '@/components/shared/places-map-canvas'
import { fromGeoPoint, getDirectionsUrl } from '@/lib/geo'
import type { CampSummary } from '@/types'

// How a camp is shown on a map and in its hover card. Shared by the camps page and a camp's own page.

export const isCampFull = (camp: Pick<CampSummary, 'availableSpots'>) => camp.availableSpots <= 0

export function campDirectionsUrl({ location }: Pick<CampSummary, 'location'>) {
  return getDirectionsUrl(location)
}

export function formatCampGps({ location }: CampSummary) {
  const [lng, lat] = location.coordinates
  return `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`
}

// The hover card of a camp, in the order the first AidBridge showed it.
export function toCampCard(camp: CampSummary): { rows: PlaceRow[]; status: PlaceStatus } {
  const full = isCampFull(camp)
  return {
    rows: [
      { label: 'Camp', value: camp.name },
      ...(camp.ngo.name ? [{ label: 'NGO', value: camp.ngo.name }] : []),
      ...(camp.address ? [{ label: 'Address', value: camp.address }] : []),
      { label: 'Capacity', value: String(camp.capacity) },
      { label: 'Free', value: String(camp.availableSpots) },
    ],
    status: { label: full ? 'Full right now' : 'Open camp', tone: full ? 'full' : 'open' },
  }
}

// What the map needs of a camp: where it is, its colour (amber when full) and its hover card.
export function toMapPlace(camp: CampSummary): MapPlace {
  return {
    id: camp.id,
    name: camp.name,
    position: fromGeoPoint(camp.location),
    tone: isCampFull(camp) ? 'full' : 'open',
    ...toCampCard(camp),
  }
}

export const CAMP_MAP_LEGEND: readonly MapLegendItem[] = [
  { label: 'Your location', tone: 'you' },
  { label: 'Open camp', tone: 'open' },
  { label: 'Full camp', tone: 'full' },
]
