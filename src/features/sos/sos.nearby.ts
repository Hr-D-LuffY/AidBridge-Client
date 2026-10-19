import type { PlaceTone } from '@/components/shared/place-card'
import type { MapLegendItem, MapPlace } from '@/components/shared/places-map-canvas'
import { formatReliefList } from '@/components/shared/relief-category'
import { formatDistance, formatRelativeTime } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import { type NearbySos, Priority } from '@/types'

// How a request is shown on a volunteer's map. The pin is the request's rounded position (about 1 km),
// never the exact one: the exact spot is shared only once the volunteer accepts.

const PRIORITY_TONE: Record<Priority, PlaceTone> = {
  [Priority.CRITICAL]: 'critical',
  [Priority.HIGH]: 'high',
  [Priority.MEDIUM]: 'medium',
  [Priority.LOW]: 'low',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  [Priority.CRITICAL]: 'Critical',
  [Priority.HIGH]: 'High',
  [Priority.MEDIUM]: 'Medium',
  [Priority.LOW]: 'Low',
}

export const NEARBY_MAP_LEGEND: readonly MapLegendItem[] = [
  { label: 'Your location', tone: 'you' },
  { label: 'Critical', tone: 'critical' },
  { label: 'High', tone: 'high' },
  { label: 'Medium', tone: 'medium' },
  { label: 'Low', tone: 'low' },
]

export function toNearbyMapPlace(sos: NearbySos): MapPlace {
  const tone = PRIORITY_TONE[sos.priority]
  return {
    id: sos.id,
    name: sos.victim.name,
    position: fromGeoPoint(sos.approximateLocation),
    tone,
    glyph: 'alert',
    href: `/volunteer/nearby/${sos.id}`,
    rows: [
      { label: 'Needs', value: formatReliefList(sos.needs) },
      { label: 'Distance', value: `about ${formatDistance(sos.distanceMeters)}` },
      { label: 'Raised', value: formatRelativeTime(sos.createdAt) },
      ...(sos.skillMatch ? [{ label: 'Skills', value: 'Matches your skills' }] : []),
    ],
    status: { label: `${PRIORITY_LABEL[sos.priority]} priority`, tone },
  }
}

export const NearbySort = {
  NEAREST: 'nearest',
  URGENT: 'urgent',
} as const
export type NearbySort = (typeof NearbySort)[keyof typeof NearbySort]

export const NEARBY_SORT_OPTIONS: readonly { value: NearbySort; label: string }[] = [
  { value: NearbySort.NEAREST, label: 'Nearest first' },
  { value: NearbySort.URGENT, label: 'Most urgent first' },
]

const PRIORITY_RANK: Record<Priority, number> = {
  [Priority.CRITICAL]: 0,
  [Priority.HIGH]: 1,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 3,
}

// The backend answers nearest first. "Most urgent" reorders what was loaded: the most urgent first,
// the nearest of those first.
export function sortNearby(items: readonly NearbySos[], sort: NearbySort): NearbySos[] {
  if (sort === NearbySort.NEAREST) return [...items]
  return [...items].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.distanceMeters - b.distanceMeters,
  )
}

export const parseNearbySort = (value: string | undefined): NearbySort =>
  NEARBY_SORT_OPTIONS.find((option) => option.value === value)?.value ?? NearbySort.NEAREST
