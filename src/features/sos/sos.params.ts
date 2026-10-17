import type { ApiQuery } from '@/lib/api/core'
import { DEFAULT_PAGE } from '@/lib/constants'
import { asDate, asList } from '@/lib/params'
import { Priority, ReliefCategory, type SosListParams, SosSort, SosStatus } from '@/types'

// How many request cards a page shows on "My requests".
export const SOS_PAGE_SIZE = 6

// The backend refuses a search shorter than 2 or longer than 100 characters.
export const SOS_SEARCH_MIN_LENGTH = 2
export const SOS_SEARCH_MAX_LENGTH = 100

export const SOS_SORT_LABEL: Record<SosSort, string> = {
  [SosSort.NEWEST]: 'Newest first',
  [SosSort.OLDEST]: 'Oldest first',
  [SosSort.PRIORITY]: 'Most urgent first',
}

// What the user chose, as it sits in the URL (?status=pending,assigned&priority=high&needs=food&q=&from=&to=&sort=).
export type SosView = {
  page: number
  status: SosStatus[]
  priority: Priority[]
  needs: ReliefCategory[]
  q: string
  // yyyy-mm-dd, as a date input gives them.
  from: string | undefined
  to: string | undefined
  sort: SosSort
}

// The URL is the source of truth for the list, so every value is checked: a hand-edited ?status=nope
// falls back to "no filter" instead of reaching the backend as a 400. A search shorter than the backend's
// minimum counts as no search. An end date before the start date is dropped too (the backend refuses it).
export function parseSosParams(raw: {
  page?: string
  status?: string
  priority?: string
  needs?: string
  q?: string
  from?: string
  to?: string
  sort?: string
}): SosView {
  const page = Number(raw.page)
  const q = (raw.q ?? '').trim().slice(0, SOS_SEARCH_MAX_LENGTH)
  const from = asDate(raw.from)
  const to = asDate(raw.to)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    status: asList(Object.values(SosStatus), raw.status),
    priority: asList(Object.values(Priority), raw.priority),
    needs: asList(Object.values(ReliefCategory), raw.needs),
    q: q.length >= SOS_SEARCH_MIN_LENGTH ? q : '',
    from,
    to: from && to && to < from ? undefined : to,
    sort: Object.values(SosSort).find((sort) => sort === raw.sort) ?? SosSort.NEWEST,
  }
}

export function toSosQuery(view: SosView, limit: number): SosListParams {
  return {
    page: view.page,
    limit,
    status: view.status.length ? view.status : undefined,
    priority: view.priority.length ? view.priority : undefined,
    needs: view.needs.length ? view.needs : undefined,
    q: view.q || undefined,
    from: view.from,
    to: view.to,
    sort: view.sort,
  }
}

// How many filters are switched on (the sort is not one).
export function countActiveFilters(view: SosView): number {
  return (
    [view.status, view.priority, view.needs].filter((list) => list.length > 0).length +
    [view.q, view.from, view.to].filter(Boolean).length
  )
}

// The query string the backend wants: a list is sent as one comma-separated value (it accepts that form).
export function toSosApiQuery(params: SosListParams): ApiQuery {
  const { status, priority, needs, ...rest } = params
  return {
    ...rest,
    status: status?.join(','),
    priority: priority?.join(','),
    needs: needs?.join(','),
  }
}
