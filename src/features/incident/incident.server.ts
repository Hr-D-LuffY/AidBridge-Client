import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Incident, IncidentListParams, Paginated } from '@/types'

// Incidents, newest first (GET /incidents).
export function getIncidentPage(params: IncidentListParams): Promise<Paginated<Incident>> {
  return serverApi.getList<Incident>('/incidents', params)
}
