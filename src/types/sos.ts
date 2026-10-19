import type { PaginationParams } from './api'
import type { DispatchState } from './dispatch'
import type {
  MediaResourceType,
  Priority,
  ReliefCategory,
  ResolvedBy,
  Skill,
  SosSort,
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
  // The "special help" the victim asked for; empty when none.
  requiredSkills: Skill[]
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
  // How the dispatch engine is treating the request. Admin and NGO only; absent for everyone else.
  dispatch?: DispatchState
  createdAt: string
  updatedAt: string
}

// GET /sos. A list filter matches any of its values; different filters combine. `q` is 2-100 characters and
// matches whole words of the description and address. `from` and `to` are dates (yyyy-mm-dd) of when the
// request was raised; a bare `to` covers that whole day. `incidentId`, `volunteerId` and `victimId` are for
// admin and NGO only (anyone else gets a 403).
export type SosListParams = PaginationParams & {
  status?: SosStatus[]
  priority?: Priority[]
  needs?: ReliefCategory[]
  q?: string
  from?: string
  to?: string
  sort?: SosSort
  incidentId?: string
  volunteerId?: string
  victimId?: string
}

export type CreateSosPayload = {
  needs: ReliefCategory[]
  // Optional, at most 4. Never blocks sending; [] on an update clears it.
  requiredSkills?: Skill[]
  // [lng, lat]
  coordinates: [number, number]
  description?: string
  address?: string
}

// PUT /sos/:id takes only what changed; an empty body or an unknown field is a 400.
export type UpdateSosPayload = Partial<CreateSosPayload> & {
  removeMediaIds?: string[]
}

// One thing that happened to a request (GET /sos/:id/timeline), as its victim or an involved volunteer
// sees it: no names, no distances. Admins and NGOs get more (Part 17).
export type SosTimelineItem = {
  id: string
  type: string
  at: string
}

// What a volunteer sees of a request they have not taken (GET /sos/nearby, and GET /sos/:id while it is
// pending): the first name, a position rounded to about 1 km, no phone, no street address, no photos.
export type LimitedSos = {
  id: string
  victim: { name: string }
  needs: ReliefCategory[]
  requiredSkills: Skill[]
  description: string | null
  approximateLocation: GeoPoint
  priority: Priority
  status: SosStatus
  createdAt: string
  // Metres from the point asked about. Only on GET /sos/nearby.
  distanceMeters?: number
}

// `skillMatch`: this volunteer has a skill the request wants (asked for outright or implied by a need);
// `matchedSkills` says which. A badge only: a volunteer without the skill still sees and can accept it.
export type NearbySos = LimitedSos & {
  distanceMeters: number
  skillMatch: boolean
  matchedSkills: Skill[]
}

export type NearbySosParams = PaginationParams & {
  lng: number
  lat: number
  // metres, 50 000 at most
  radius?: number
  // Keep only requests that want any of these skills.
  skills?: Skill[]
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
