import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Paginated, UserListParams, UserProfile } from '@/types'

// Accounts (GET /users, admin: full profiles).
export function getUserPage(params: UserListParams): Promise<Paginated<UserProfile>> {
  return serverApi.getList<UserProfile>('/users', params)
}

// One account (GET /users/:id). An admin gets the full profile.
export function getUser(id: string): Promise<UserProfile> {
  return serverApi.get<UserProfile>(`/users/${id}`)
}
