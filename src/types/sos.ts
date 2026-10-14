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
