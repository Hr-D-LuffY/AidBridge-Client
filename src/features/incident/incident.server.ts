import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Incident, IncidentListParams, Paginated } from '@/types'

// Incidents, newest first (GET /incidents).
export function getIncidentPage(params: IncidentListParams): Promise<Paginated<Incident>> {
  return serverApi.getList<Incident>('/incidents', params)
}

// One incident (GET /incidents/:id). 404 when it is missing or deleted.
export function getIncident(id: string): Promise<Incident> {
  return serverApi.get<Incident>(`/incidents/${id}`)
}
