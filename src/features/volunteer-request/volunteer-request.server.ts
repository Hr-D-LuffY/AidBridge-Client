import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Paginated, VolunteerRequest } from '@/types'

export function getMyVolunteerRequests(): Promise<Paginated<VolunteerRequest>> {
  return serverApi.getList<VolunteerRequest>('/volunteer-requests/me', { limit: 20 })
}
