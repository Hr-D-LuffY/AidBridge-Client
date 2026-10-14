import { clientApi } from '@/lib/api/client'
import type { NearbyCamp, NearbyCampParams } from '@/types'

export const campApi = {
  // Active camps around a point, nearest first (victims and admins only).
  nearby: (params: NearbyCampParams, signal?: AbortSignal) =>
    clientApi.getList<NearbyCamp>('/camps/nearby', params, signal),
}
