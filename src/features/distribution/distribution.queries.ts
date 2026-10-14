'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campKeys } from '@/features/camp/camp.keys'
import { distributionApi } from './distribution.api'

// Hands out one item. The camps (and so the stock shown) are read again whether it worked or not: a
// 409 means the camp had less than asked, and the new amounts are what the volunteer needs to see. The
// form shows its own errors, so the global toast is off.
export function useHandOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: distributionApi.create,
    meta: { skipGlobalError: true },
    onSuccess: ({ item, recipient }) => {
      toast.success(
        `Handed out ${item.quantity} ${item.unit} of ${item.itemName} to ${recipient.name}.`,
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: campKeys.mineAll() }),
  })
}
