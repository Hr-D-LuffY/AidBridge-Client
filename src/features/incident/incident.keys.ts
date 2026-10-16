import type { IncidentListParams } from '@/types'

// One key factory for every incident query. Plain module: the server pages import it too.
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (params: IncidentListParams) => [...incidentKeys.lists(), params] as const,
  // The ids of the requests linked to one incident, as the last link or unlink call reported them. The
  // backend sends them only in that answer, so this entry is filled by the mutation and never fetched.
  links: (id: string) => [...incidentKeys.all, 'links', id] as const,
}
