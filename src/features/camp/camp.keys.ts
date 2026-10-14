import type { NearbyCampParams } from '@/types'

export const campKeys = {
  all: ['camps'] as const,
  nearby: (params: NearbyCampParams) => [...campKeys.all, 'nearby', params] as const,
}
