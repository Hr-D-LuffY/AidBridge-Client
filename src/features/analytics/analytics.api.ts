import { clientApi } from '@/lib/api/client'
import type { LiveMap } from '@/types'

export const analyticsApi = {
  // Open requests and active camps (NGO and admin). No phone numbers are part of it.
  liveMap: (signal?: AbortSignal) =>
    clientApi.get<LiveMap>('/analytics/live-map', undefined, signal),
}
