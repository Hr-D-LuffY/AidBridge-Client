import type { PaginationParams } from './api'
import type {
  MediaResourceType,
  Priority,
  ReliefCategory,
  ResolvedBy,
  SosStatus,
  TaskStatus,
} from './enums'
import type { GeoPoint } from './user'

export type MediaItem = {
  id: string
  url: string
  resourceType: MediaResourceType
}

export type SosPerson = {
  id: string
  name: string
  phone: string
}

// The volunteer's task on a request, as its victim sees it (only on GET /sos/:id for the victim). `null`
// while nobody has taken the request. `canRate` is true once the task is completed and not yet rated.
export type SosTaskSummary = {
  id: string
  status: TaskStatus
  isRated: boolean
  canRate: boolean
}

// The full view: what the victim, the assigned volunteer, admins and NGOs get. Volunteers who have not
// taken the request get a limited view instead (part 6), so never assume `phone` exists everywhere.
export type SosRequest = {
  id: string
  victim: SosPerson
  assignedVolunteer: SosPerson | null
  needs: ReliefCategory[]
  description: string | null
  media: MediaItem[]
  location: GeoPoint
  address: string | null
  priority: Priority
  status: SosStatus
  resolvedAt: string | null
  resolvedBy: ResolvedBy | null
  resolveReason: string | null
  // Present on the single-request read for the victim; the list does not carry it.
  task?: SosTaskSummary | null
  createdAt: string
  updatedAt: string
}

export type SosListParams = PaginationParams & {
  status?: SosStatus
  priority?: Priority
}

export type CreateSosPayload = {
  needs: ReliefCategory[]
  // [lng, lat]
  coordinates: [number, number]
  description?: string
  address?: string
}

// PUT /sos/:id takes only what changed; an empty body or an unknown field is a 400.
export type UpdateSosPayload = Partial<CreateSosPayload> & {
  removeMediaIds?: string[]
}

// What a volunteer sees of a request they have not taken (GET /sos/nearby, and GET /sos/:id while it is
// pending): the first name, a position rounded to about 1 km, no phone, no street address, no photos.
export type LimitedSos = {
  id: string
  victim: { name: string }
  needs: ReliefCategory[]
  description: string | null
  approximateLocation: GeoPoint
  priority: Priority
  status: SosStatus
  createdAt: string
  // Metres from the point asked about. Only on GET /sos/nearby.
  distanceMeters?: number
}

export type NearbySos = LimitedSos & { distanceMeters: number }

export type NearbySosParams = PaginationParams & {
  lng: number
  lat: number
  // metres, 50 000 at most
  radius?: number
}

// GET /sos/:id answers a volunteer with the full request once it is theirs and the limited one while it
// is pending. They are told apart by what they carry, so a missing field is never assumed.
export type SosView = SosRequest | LimitedSos

export function isFullSos(sos: SosView): sos is SosRequest {
  return 'location' in sos
}

// PUT /sos/:id/reject. `declined`: the request is hidden from this volunteer's list for good.
// `withdrawn`: the volunteer backed out of a request they had accepted, and it is open to others again.
export type RejectSosResult = {
  sosRequestId: string
  outcome: 'declined' | 'withdrawn'
}
