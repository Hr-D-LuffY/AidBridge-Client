import { Priority, type SosRequest, SosStatus } from '@/types'
import { SOS_PAGE_SIZE, SosSort, type SosViewParams } from './sos.params'

const PRIORITY_RANK: Record<Priority, number> = {
  [Priority.CRITICAL]: 0,
  [Priority.HIGH]: 1,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 3,
}

// Where a status sits when "open requests first" is chosen: the one that needs the person most is first.
const STATUS_RANK: Record<SosStatus, number> = {
  [SosStatus.PENDING]: 0,
  [SosStatus.ASSIGNED]: 1,
  [SosStatus.ON_THE_WAY]: 2,
  [SosStatus.RESCUED]: 3,
  [SosStatus.CLOSED]: 4,
}

const byNewest = (a: SosRequest, b: SosRequest) => b.createdAt.localeCompare(a.createdAt)

const COMPARE: Record<SosSort, (a: SosRequest, b: SosRequest) => number> = {
  [SosSort.NEWEST]: byNewest,
  [SosSort.OLDEST]: (a, b) => a.createdAt.localeCompare(b.createdAt),
  [SosSort.PRIORITY]: (a, b) =>
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byNewest(a, b),
  [SosSort.STATUS]: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || byNewest(a, b),
}

function matches(sos: SosRequest, view: SosViewParams) {
  if (view.status && sos.status !== view.status) return false
  if (view.priority && sos.priority !== view.priority) return false
  if (view.need && !sos.needs.includes(view.need)) return false
  if (view.q) {
    const haystack = [sos.address, sos.description, sos.assignedVolunteer?.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(view.q.toLowerCase())) return false
  }
  return true
}

export type SosPage = {
  items: SosRequest[]
  // How many requests match the filters (all pages).
  total: number
  page: number
  totalPages: number
}

// Filters, sorts and cuts the page. A page past the end (a stale link, a filter that now matches
// less) shows the last page instead of an empty one.
export function applySosView(requests: readonly SosRequest[], view: SosViewParams): SosPage {
  const filtered = requests.filter((sos) => matches(sos, view)).sort(COMPARE[view.sort])
  const totalPages = Math.max(1, Math.ceil(filtered.length / SOS_PAGE_SIZE))
  const page = Math.min(view.page, totalPages)
  const start = (page - 1) * SOS_PAGE_SIZE
  return {
    items: filtered.slice(start, start + SOS_PAGE_SIZE),
    total: filtered.length,
    page,
    totalPages,
  }
}
