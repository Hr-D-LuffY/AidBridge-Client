import { ADMIN_PAGE_SIZE, DEFAULT_PAGE } from '@/lib/constants'
import { Priority, type SosListParams, SosStatus } from '@/types'

const STATUSES = Object.values(SosStatus)
const PRIORITIES = Object.values(Priority)

export type AdminSosView = {
  page: number
  status: SosStatus | undefined
  priority: Priority | undefined
}

// The admin list is paged by the server (it holds every request on the platform, unlike a victim's
// own few), and the backend filters by status and priority. The URL is the source of truth, so each
// value is checked: a hand-edited ?status=nope means "no filter" instead of reaching the backend as a 400.
export function parseAdminSosParams(raw: {
  page?: string
  status?: string
  priority?: string
}): AdminSosView {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    status: STATUSES.find((status) => status === raw.status),
    priority: PRIORITIES.find((priority) => priority === raw.priority),
  }
}

export function toAdminSosQuery(view: AdminSosView): SosListParams {
  return {
    page: view.page,
    limit: ADMIN_PAGE_SIZE,
    status: view.status,
    priority: view.priority,
  }
}
