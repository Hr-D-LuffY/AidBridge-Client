import { ADMIN_PAGE_SIZE, DEFAULT_PAGE } from '@/lib/constants'
import { type VolunteerRequestListParams, VolunteerRequestStatus } from '@/types'

// The queue opens on what needs a decision. `all` (in the URL) shows every request.
export const REVIEW_FILTERS = [
  VolunteerRequestStatus.PENDING,
  VolunteerRequestStatus.APPROVED,
  VolunteerRequestStatus.REJECTED,
  'all',
] as const
export type ReviewFilter = (typeof REVIEW_FILTERS)[number]

export const REVIEW_FILTER_OPTIONS: readonly { value: ReviewFilter; label: string }[] = [
  { value: VolunteerRequestStatus.PENDING, label: 'Needs review' },
  { value: VolunteerRequestStatus.APPROVED, label: 'Approved' },
  { value: VolunteerRequestStatus.REJECTED, label: 'Not approved' },
  { value: 'all', label: 'Everything' },
]

export type ReviewView = { page: number; filter: ReviewFilter }

// The URL is the source of truth, so each value is checked: a hand-edited ?status=nope falls back to
// "needs review" instead of reaching the backend as a 400.
export function parseReviewParams(raw: { page?: string; status?: string }): ReviewView {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    filter:
      REVIEW_FILTERS.find((filter) => filter === raw.status) ?? VolunteerRequestStatus.PENDING,
  }
}

export function toReviewQuery(view: ReviewView): VolunteerRequestListParams {
  return {
    page: view.page,
    limit: ADMIN_PAGE_SIZE,
    status: view.filter === 'all' ? undefined : view.filter,
  }
}
