import { authApi, clientApi } from '@/lib/api/client'
import type {
  CreateAccountPayload,
  UpdateProfilePayload,
  UserListParams,
  UserProfile,
  VolunteerContact,
  VolunteerListParams,
} from '@/types'
import type { ChangePasswordBody } from './user.schema'

// The signed-in user's own account (GET/PUT/DELETE /auth/me and the password).
export const userApi = {
  // Only the fields that changed: the backend refuses an empty body and unknown fields.
  update: (payload: UpdateProfilePayload) => clientApi.put<UserProfile>('/auth/me', payload),
  // Soft delete. Refused with 409 while a request the user is part of is still unfinished.
  remove: () => clientApi.delete('/auth/me'),
  // Our own route handler, which also stores the fresh token (see api/auth/change-password).
  changePassword: (body: ChangePasswordBody) => authApi.post<null>('/change-password', body),

  // The volunteers an NGO or admin can work with, with the contact details they need (GET /users).
  volunteers: (params: VolunteerListParams, signal?: AbortSignal) =>
    clientApi.getList<VolunteerContact>('/users', params, signal),

  // Admin: every account, with its full profile.
  list: (params: UserListParams, signal?: AbortSignal) =>
    clientApi.getList<UserProfile>('/users', params, signal),
  // Admin: blocks an account. It cannot log in at once and its session ends on its next request; for a
  // victim the unfinished requests are closed too. 403 for an admin account, 409 if already blocked.
  block: (id: string, reason?: string) =>
    clientApi.put<UserProfile>(`/users/${id}/block`, reason ? { reason } : {}),
  // Admin: lifts the block. 409 if the account is not blocked.
  unblock: (id: string) => clientApi.put<UserProfile>(`/users/${id}/unblock`),
  // Admin: creates an NGO or another admin. No token comes back, and the admin hands the password over.
  createAccount: (payload: CreateAccountPayload) => clientApi.post<UserProfile>('/users', payload),
}
