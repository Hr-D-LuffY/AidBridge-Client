import 'server-only'
import { serverApi } from '@/lib/api/server'
import type {
  AdminVolunteerRequest,
  Paginated,
  VolunteerRequest,
  VolunteerRequestListParams,
} from '@/types'

export function getMyVolunteerRequests(): Promise<Paginated<VolunteerRequest>> {
  return serverApi.getList<VolunteerRequest>('/volunteer-requests/me', { limit: 20 })
}

// The review queue (GET /volunteer-requests, admin).
export function getVolunteerRequestPage(
  params: VolunteerRequestListParams,
): Promise<Paginated<AdminVolunteerRequest>> {
  return serverApi.getList<AdminVolunteerRequest>('/volunteer-requests', params)
}
