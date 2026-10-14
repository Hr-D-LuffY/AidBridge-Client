import { clientApi } from '@/lib/api/client'
import type { CreateDistributionPayload, Distribution } from '@/types'

export const distributionApi = {
  // A volunteer hands out one item from a camp to the person they are helping. Stock comes off and the
  // record is written together; 409 when the camp has less than asked (the message says how much is left).
  create: (payload: CreateDistributionPayload) =>
    clientApi.post<Distribution>('/distribution', payload),
}
