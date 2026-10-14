import type { MyCampsParams, NearbyCampParams } from '@/types'

export const campKeys = {
  all: ['camps'] as const,
  nearby: (params: NearbyCampParams) => [...campKeys.all, 'nearby', params] as const,
  // The camps a volunteer is assigned to, each with its stock.
  mine: (params: MyCampsParams) => [...campKeys.all, 'mine', params] as const,
  mineAll: () => [...campKeys.all, 'mine'] as const,
}
