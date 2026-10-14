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
