import { authApi, clientApi } from '@/lib/api/client'
import type {
  UpdateProfilePayload,
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
}
