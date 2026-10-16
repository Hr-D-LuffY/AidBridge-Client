'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { VolunteerRequestListParams } from '@/types'
import { volunteerRequestApi } from './volunteer-request.api'
import { volunteerRequestKeys } from './volunteer-request.keys'

export function useMyVolunteerRequestsQuery() {
  return useQuery({
    queryKey: volunteerRequestKeys.mine(),
    queryFn: ({ signal }) => volunteerRequestApi.mine(signal),
  })
}

// The form shows the backend's message itself (no phone yet, one already pending), so the global
// toast is off. A 409 means a request is already waiting, so the list is refreshed either way.
export function useCreateVolunteerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => volunteerRequestApi.create(message),
    meta: { skipGlobalError: true },
    onSuccess: () => toast.success('Request sent. An administrator will review it.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: volunteerRequestKeys.all }),
  })
}

// A page of the review queue. The filter and page live in the URL, so a change keeps the old rows on
// screen until the new ones arrive.
export function useVolunteerRequestsQuery(params: VolunteerRequestListParams) {
  return useQuery({
    queryKey: volunteerRequestKeys.list(params),
    queryFn: ({ signal }) => volunteerRequestApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

type ReviewInput = { id: string; applicant: string; note?: string }

// Approve or reject. A 409 means another admin got there first (or the applicant changed): the global
// toast shows the backend's reason, and the queue is read again either way so the row shows its real state.
export function useReviewVolunteerRequest(action: 'approve' | 'reject') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: ReviewInput) =>
      action === 'approve'
        ? volunteerRequestApi.approve(id, note)
        : volunteerRequestApi.reject(id, note),
    onSuccess: (_request, { applicant }) =>
      toast.success(
        action === 'approve'
          ? `${applicant} is now a volunteer. They were told.`
          : `${applicant}'s request was not approved. They were told.`,
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: volunteerRequestKeys.lists() }),
  })
}
