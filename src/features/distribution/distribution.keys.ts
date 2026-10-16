import type { DistributionListParams } from '@/types'

// One key factory for the hand-out history. Plain module: the server pages import it too.
export const distributionKeys = {
  all: ['distribution'] as const,
  list: (params: DistributionListParams) => [...distributionKeys.all, 'list', params] as const,
}
