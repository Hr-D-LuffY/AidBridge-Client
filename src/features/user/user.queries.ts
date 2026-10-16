'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/client'
import { MAX_PAGE_SIZE } from '@/lib/constants'
import type { UpdateProfilePayload, VolunteerListParams } from '@/types'
import { userApi } from './user.api'
import { userKeys } from './user.keys'
import type { ChangePasswordBody } from './user.schema'

// Saves some of the user's own details. The profile lives in the area layout (SessionProvider), so
// `router.refresh()` re-reads it there and the new name shows in the menu at once. The forms show
// their own errors, so the global toast is off.
export function useUpdateProfile(successMessage = 'Saved.') {
  const router = useRouter()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.update(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      toast.success(successMessage)
      router.refresh()
    },
  })
}

// The route handler has already stored the new token, so the user stays signed in.
export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) => userApi.changePassword(body),
    meta: { skipGlobalError: true },
    onSuccess: () => toast.success('Password changed. Your other devices were signed out.'),
  })
}

// After the account is gone the token is dead, so the cookies and the whole cache are dropped with a
// full page load, like logging out. A 409 means a request is still open: the dialog explains it.
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await userApi.remove()
      await authApi.post<null>('/logout')
    },
    meta: { skipGlobalError: true },
    onSuccess: () => window.location.assign('/login'),
  })
}

// Every volunteer is asked for at once (a camp team and the hand-out filter pick from the same list), so
// the first 100 are read. `enabled` keeps a closed form or an unused filter from asking.
const VOLUNTEER_PARAMS: VolunteerListParams = { role: 'volunteer', limit: MAX_PAGE_SIZE }

export function useVolunteersQuery(enabled = true) {
  return useQuery({
    queryKey: userKeys.volunteers(VOLUNTEER_PARAMS),
    queryFn: ({ signal }) => userApi.volunteers(VOLUNTEER_PARAMS, signal),
    enabled,
  })
}
