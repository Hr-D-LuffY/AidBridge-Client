import { clientApi } from '@/lib/api/client'
import type { CreateDistributionPayload, Distribution, DistributionListParams } from '@/types'

export const distributionApi = {
  // A volunteer hands out one item from a camp to the person they are helping. Stock comes off and the
  // record is written together; 409 when the camp has less than asked (the message says how much is left).
  create: (payload: CreateDistributionPayload) =>
    clientApi.post<Distribution>('/distribution', payload),
  // The hand-out history, newest first. An NGO sees only its own camps' hand-outs; an admin sees all.
  list: (params: DistributionListParams, signal?: AbortSignal) =>
    clientApi.getList<Distribution>('/distribution', params, signal),
}
