import type { NearbySosParams, SosListParams } from '@/types'

// One key factory for every SOS query, so a mutation can invalidate "all lists" or "this request"
// without writing key arrays by hand. Plain module: the server pages import it too.
export const sosKeys = {
  all: ['sos'] as const,
  lists: () => [...sosKeys.all, 'list'] as const,
  list: (params: SosListParams) => [...sosKeys.lists(), params] as const,
  detail: (id: string) => [...sosKeys.all, 'detail', id] as const,
  // What happened to one request (offers, widening, escalation), for its victim.
  timeline: (id: string) => [...sosKeys.all, 'timeline', id] as const,
  // A volunteer's map and list of requests around a point.
  nearbyLists: () => [...sosKeys.all, 'nearby'] as const,
  nearby: (params: NearbySosParams) => [...sosKeys.nearbyLists(), params] as const,
}
