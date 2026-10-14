'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
