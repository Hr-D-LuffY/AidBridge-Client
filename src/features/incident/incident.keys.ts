import type { IncidentListParams } from '@/types'

// One key factory for every incident query. Plain module: the server pages import it too.
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (params: IncidentListParams) => [...incidentKeys.lists(), params] as const,
  // One incident. An admin or NGO also gets `sosRequests`, the ids of the requests linked to it.
  detail: (id: string) => [...incidentKeys.all, 'detail', id] as const,
}
