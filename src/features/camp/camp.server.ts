import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AssignedCamp, CampSummary, MyCampsParams, Paginated } from '@/types'

// The volunteer's own camps with their stock (GET /camps/my-assigned).
export function getMyCamps(params: MyCampsParams): Promise<Paginated<AssignedCamp>> {
  return serverApi.getList<AssignedCamp>('/camps/my-assigned', params)
}

// One active camp (GET /camps/:id), for the camp's own page.
export function getCamp(id: string): Promise<CampSummary> {
  return serverApi.get<CampSummary>(`/camps/${id}`)
}
