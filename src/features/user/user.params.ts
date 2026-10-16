import { ADMIN_PAGE_SIZE, DEFAULT_PAGE } from '@/lib/constants'
import { Role, type UserListParams } from '@/types'

const ROLES = Object.values(Role)

export type UsersView = { page: number; role: Role | undefined; blocked: boolean }

// The URL is the source of truth, so each value is checked: a hand-edited ?role=nope means "everyone"
// instead of reaching the backend as a 400.
export function parseUsersParams(raw: {
  page?: string
  role?: string
  blocked?: string
}): UsersView {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    role: ROLES.find((role) => role === raw.role),
    blocked: raw.blocked === '1',
  }
}

export function toUsersQuery(view: UsersView): UserListParams {
  return {
    page: view.page,
    limit: ADMIN_PAGE_SIZE,
    role: view.role,
    blocked: view.blocked ? true : undefined,
  }
}
