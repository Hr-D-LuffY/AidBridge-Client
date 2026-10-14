import type { GeoPoint } from '@/types/user'

// The only place where coordinate order is swapped. The backend (GeoJSON) is [lng, lat]; browsers
// and map libraries use { lat, lng } or [lat, lng]. Never inline the swap anywhere else.

export type LatLng = {
  lat: number
  lng: number
}

export function toGeoPoint({ lat, lng }: LatLng): GeoPoint {
  return { type: 'Point', coordinates: [lng, lat] }
}

// The `[lng, lat]` pair the backend takes in request bodies (PUT /auth/me, POST /sos).
export function toLngLat({ lat, lng }: LatLng): [number, number] {
  return [lng, lat]
}

export function fromGeoPoint(point: GeoPoint): LatLng {
  const [lng, lat] = point.coordinates
  return { lat, lng }
}

const EARTH_RADIUS_METERS = 6_371_000

// Straight-line distance between two points in metres (haversine). It is "as the crow flies", shorter
// than the road, so screens say "in a straight line" next to it and offer directions for the road.
export function distanceBetween(a: LatLng, b: LatLng): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}

// A Google Maps link that opens directions to a point (a camp, or the person a volunteer is going to).
export function getDirectionsUrl(point: GeoPoint): string {
  const { lat, lng } = fromGeoPoint(point)
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Where the map opens before any position is known: all of Bangladesh.
export const DEFAULT_MAP_CENTER: LatLng = { lat: 23.685, lng: 90.356 }
export const DEFAULT_MAP_ZOOM = 7
// Close enough to see streets, used once the user's position is known.
export const LOCATED_MAP_ZOOM = 16
