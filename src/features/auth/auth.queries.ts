'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi, clientApi } from '@/lib/api/client'
import { getErrorMessage } from '@/lib/api/errors'
import { resolvePostLoginPath } from '@/lib/auth/redirect'
import type { SessionUser } from '@/types/user'
import type { LoginInput, RegisterInput } from './auth.schema'
import type { DemoRole } from './demo-roles'

// Login and logout must keep authKeys.session in step so the navbar switches state.
export const authKeys = {
  session: ['auth', 'session'] as const,
}

// The logged-in user, or null. For public pages, which are static and so cannot read the cookie on
// the server. Area layouts get the live profile from their layout (SessionProvider) instead.
export function useSessionQuery() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authApi.get<SessionUser | null>('/session'),
    // A failed check just shows the logged-out navbar. No toast for it.
    meta: { skipGlobalError: true },
  })
}

// Runs after any successful login: share the user with the navbar, then go to the requested page
// (only if it is theirs to open) or their own area.
function useAfterLogin(redirect: string | null | undefined) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return (session: SessionUser) => {
    queryClient.setQueryData(authKeys.session, session)
    router.replace(resolvePostLoginPath(redirect, session.role))
    router.refresh()
  }
}

// The login mutations handle their own errors (an inline message, a field error, a toast), so the
// global toast is switched off for them. A 401 here is "wrong password", never "session expired".

export function useLoginMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (values: LoginInput) => authApi.post<SessionUser>('/login', values),
    meta: { skipGlobalError: true },
    onSuccess: afterLogin,
  })
}

// Sign-up signs the new account in as well (the backend returns a token), so it ends like a login.
export function useRegisterMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (values: RegisterInput) => authApi.post<SessionUser>('/register', values),
    meta: { skipGlobalError: true },
    onSuccess: (session) => {
      toast.success('Account created. Welcome to AidBridge.')
      afterLogin(session)
    },
  })
}

export function useDemoLoginMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (role: DemoRole) => authApi.post<SessionUser>('/demo-login', { role }),
    meta: { skipGlobalError: true },
    onSuccess: afterLogin,
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

// A full page load to /login, not a client-side navigation: it drops the whole TanStack Query cache
// and every bit of React state, so nothing of the last user is left behind for the next one. A
// failure (the network is down) gets the global toast.
export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authApi.post<null>('/logout'),
    onSuccess: () => window.location.assign('/login'),
  })
}

// Both password-reset calls are public backend routes, so they go through the BFF proxy without a
// token. The backend always answers 200 to "forgot" (it never reveals which emails exist).
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (values: { email: string }) =>
      clientApi.post<null>('/auth/forgot-password', values),
    meta: { skipGlobalError: true },
  })
}

export function useResetPasswordMutation(token: string) {
  return useMutation({
    mutationFn: (values: { password: string }) =>
      clientApi.put<null>(`/auth/reset-password/${token}`, values),
    meta: { skipGlobalError: true },
  })
}
