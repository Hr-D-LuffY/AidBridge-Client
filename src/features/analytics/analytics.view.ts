import type { PlaceTone } from '@/components/shared/place-card'
import type { MapLegendItem, MapPlace } from '@/components/shared/places-map-canvas'
import { formatReliefList } from '@/components/shared/relief-category'
import { formatRelativeTime } from '@/lib/format'
import { fromGeoPoint } from '@/lib/geo'
import { type LiveMapCamp, type LiveMapRequest, Priority, SosStatus } from '@/types'

// How the live map draws what is open right now: camps as houses (green, amber when full) and requests as
// warning triangles coloured by priority. No phone numbers, and the hover card says nothing the lists
// below the map do not.

const PRIORITY_TONE: Record<Priority, PlaceTone> = {
  [Priority.CRITICAL]: 'critical',
  [Priority.HIGH]: 'high',
  [Priority.MEDIUM]: 'medium',
  [Priority.LOW]: 'low',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  [Priority.CRITICAL]: 'Critical',
  [Priority.HIGH]: 'High',
  [Priority.MEDIUM]: 'Medium',
  [Priority.LOW]: 'Low',
}

export const REQUEST_STATUS_LABEL: Record<SosStatus, string> = {
  [SosStatus.PENDING]: 'Waiting for a volunteer',
  [SosStatus.ASSIGNED]: 'Volunteer assigned',
  [SosStatus.ON_THE_WAY]: 'Help is on the way',
  [SosStatus.RESCUED]: 'Rescued',
  [SosStatus.CLOSED]: 'Closed',
}

export const LIVE_MAP_LEGEND: readonly MapLegendItem[] = [
  { label: 'Open camp', tone: 'open' },
  { label: 'Full camp', tone: 'full' },
  { label: 'Critical request', tone: 'critical' },
  { label: 'High request', tone: 'high' },
  { label: 'Medium request', tone: 'medium' },
  { label: 'Low request', tone: 'low' },
]

export const isLiveCampFull = (camp: Pick<LiveMapCamp, 'availableSpots'>) =>
  camp.availableSpots <= 0

export function toLiveCampPlace(camp: LiveMapCamp): MapPlace {
  const full = isLiveCampFull(camp)
  return {
    id: camp.id,
    name: camp.name,
    position: fromGeoPoint(camp.location),
    tone: full ? 'full' : 'open',
    glyph: 'house',
    // A camp has no page of its own to open here; only a request has details.
    openable: false,
    rows: [
      { label: 'Camp', value: camp.name },
      { label: 'NGO', value: camp.ngo.name },
      ...(camp.address ? [{ label: 'Address', value: camp.address }] : []),
      { label: 'People', value: `${camp.currentOccupancy} of ${camp.capacity}` },
      { label: 'Free', value: String(camp.availableSpots) },
    ],
    status: { label: full ? 'Full right now' : 'Open camp', tone: full ? 'full' : 'open' },
  }
}

export function toLiveRequestPlace(request: LiveMapRequest): MapPlace {
  const tone = PRIORITY_TONE[request.priority]
  return {
    id: request.id,
    name: request.victim.name,
    position: fromGeoPoint(request.location),
    tone,
    glyph: 'alert',
    rows: [
      { label: 'Needs', value: formatReliefList(request.needs) },
      { label: 'Status', value: REQUEST_STATUS_LABEL[request.status] },
      ...(request.assignedVolunteer
        ? [{ label: 'Volunteer', value: request.assignedVolunteer.name }]
        : []),
      { label: 'Raised', value: formatRelativeTime(request.createdAt) },
    ],
    status: { label: `${PRIORITY_LABEL[request.priority]} priority`, tone },
  }
}
