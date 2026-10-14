import { DEFAULT_PAGE } from '@/lib/constants'
import { Priority, ReliefCategory, type SosListParams, SosStatus } from '@/types'

// How many request cards a page shows.
export const SOS_PAGE_SIZE = 6

// A person has very few requests, so the list asks for the 100 newest once (the backend's maximum)
// and the page filters, sorts and splits them in the browser: no request per filter click. The backend
// sorts newest first and only filters by status and priority, so search, needs and sort order live here.
export const SOS_FETCH_PARAMS: SosListParams = { limit: 100 }

export const SosSort = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRIORITY: 'priority',
  STATUS: 'status',
} as const
export type SosSort = (typeof SosSort)[keyof typeof SosSort]

export const SOS_SORT_LABEL: Record<SosSort, string> = {
  [SosSort.NEWEST]: 'Newest first',
  [SosSort.OLDEST]: 'Oldest first',
  [SosSort.PRIORITY]: 'Most urgent first',
  [SosSort.STATUS]: 'Open requests first',
}

export type SosViewParams = {
  page: number
  status?: SosStatus
  priority?: Priority
  need?: ReliefCategory
  q: string
  sort: SosSort
}

const oneOf = <T extends string>(allowed: readonly T[], value: string | undefined) =>
  allowed.find((option) => option === value)

// The URL is the source of truth for the list, so every value is checked: a hand-edited ?status=nope
// falls back to "no filter" instead of showing nothing.
export function parseSosViewParams(raw: {
  page?: string
  status?: string
  priority?: string
  need?: string
  q?: string
  sort?: string
}): SosViewParams {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    status: oneOf(Object.values(SosStatus), raw.status),
    priority: oneOf(Object.values(Priority), raw.priority),
    need: oneOf(Object.values(ReliefCategory), raw.need),
    q: (raw.q ?? '').trim().slice(0, 100),
    sort: oneOf(Object.values(SosSort), raw.sort) ?? SosSort.NEWEST,
  }
}

export function countActiveFilters(view: SosViewParams): number {
  return [view.status, view.priority, view.need, view.q || undefined].filter(Boolean).length
}
