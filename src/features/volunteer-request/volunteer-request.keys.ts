import type { VolunteerRequestListParams } from '@/types'

export const volunteerRequestKeys = {
  all: ['volunteer-requests'] as const,
  mine: () => [...volunteerRequestKeys.all, 'mine'] as const,
  // Admin: the review queue.
  lists: () => [...volunteerRequestKeys.all, 'list'] as const,
  list: (params: VolunteerRequestListParams) => [...volunteerRequestKeys.lists(), params] as const,
}
