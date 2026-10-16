import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Distribution, DistributionListParams, Paginated } from '@/types'

// The hand-out history (GET /distribution).
export function getDistributionPage(
  params: DistributionListParams,
): Promise<Paginated<Distribution>> {
  return serverApi.getList<Distribution>('/distribution', params)
}
