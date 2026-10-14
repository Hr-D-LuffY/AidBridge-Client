'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sosKeys } from '@/features/sos/sos.keys'
import type { SosRequest } from '@/types'
import { taskApi } from './task.api'

// Rates the volunteer on a request. On success the request in the cache is marked as rated, so the
// card turns into a thank-you without waiting for the next poll. The card shows its own error (a 409
// means it was already rated, for example from another device).
export function useRateTask(sosId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, score }: { taskId: string; score: number }) =>
      taskApi.rate(taskId, score),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      queryClient.setQueryData<SosRequest>(sosKeys.detail(sosId), (current) =>
        current?.task
          ? { ...current, task: { ...current.task, isRated: true, canRate: false } }
          : current,
      )
      toast.success('Thank you. Your rating helps other people choose who to trust.')
    },
    // A 409 or 403 can mean the state changed elsewhere, so read the request again either way.
    onSettled: () => queryClient.invalidateQueries({ queryKey: sosKeys.detail(sosId) }),
  })
}
