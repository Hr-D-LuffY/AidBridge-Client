import type { UserListParams, VolunteerListParams } from '@/types'

export const userKeys = {
  all: ['users'] as const,
  // The volunteers an NGO can assign to a camp or filter hand-outs by.
  volunteers: (params: VolunteerListParams) => [...userKeys.all, 'volunteers', params] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
}
