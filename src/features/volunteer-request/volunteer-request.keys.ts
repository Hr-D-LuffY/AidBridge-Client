export const volunteerRequestKeys = {
  all: ['volunteer-requests'] as const,
  mine: () => [...volunteerRequestKeys.all, 'mine'] as const,
}
