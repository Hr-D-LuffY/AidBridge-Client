import { ADMIN_PAGE_SIZE, DEFAULT_PAGE } from '@/lib/constants'
import { DisasterType, type IncidentListParams, IncidentStatus, Priority } from '@/types'

const STATUSES = Object.values(IncidentStatus)
const PRIORITIES = Object.values(Priority)
const DISASTERS = Object.values(DisasterType)

export type IncidentView = {
  page: number
  status: IncidentStatus | undefined
  priority: Priority | undefined
  disasterType: DisasterType | undefined
}

// The URL is the source of truth, so each value is checked: a hand-edited ?status=nope means "no filter"
// instead of reaching the backend as a 400.
export function parseIncidentParams(raw: {
  page?: string
  status?: string
  priority?: string
  type?: string
}): IncidentView {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    status: STATUSES.find((status) => status === raw.status),
    priority: PRIORITIES.find((priority) => priority === raw.priority),
    disasterType: DISASTERS.find((type) => type === raw.type),
  }
}

export function toIncidentQuery(view: IncidentView): IncidentListParams {
  return {
    page: view.page,
    limit: ADMIN_PAGE_SIZE,
    status: view.status,
    priority: view.priority,
    disasterType: view.disasterType,
  }
}
