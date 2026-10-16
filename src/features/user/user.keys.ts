import type { VolunteerListParams } from '@/types'

export const userKeys = {
  all: ['users'] as const,
  // The volunteers an NGO can assign to a camp or filter hand-outs by.
  volunteers: (params: VolunteerListParams) => [...userKeys.all, 'volunteers', params] as const,
}
