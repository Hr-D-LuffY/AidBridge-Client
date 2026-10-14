import { clientApi } from '@/lib/api/client'
import type { AssignedCamp, MyCampsParams, NearbyCamp, NearbyCampParams } from '@/types'

export const campApi = {
  // Active camps around a point, nearest first (victims and admins only).
  nearby: (params: NearbyCampParams, signal?: AbortSignal) =>
    clientApi.getList<NearbyCamp>('/camps/nearby', params, signal),
  // The active camps the volunteer is assigned to, each with the items in stock there.
  mine: (params: MyCampsParams, signal?: AbortSignal) =>
    clientApi.getList<AssignedCamp>('/camps/my-assigned', params, signal),
}
