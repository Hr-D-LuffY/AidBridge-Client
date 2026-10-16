import { DEFAULT_PAGE, NGO_PAGE_SIZE } from '@/lib/constants'
import type { DistributionListParams } from '@/types'

const OBJECT_ID = /^[0-9a-f]{24}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

export type DistributionView = {
  page: number
  camp: string | undefined
  volunteer: string | undefined
  // yyyy-mm-dd, as a date input gives them.
  from: string | undefined
  to: string | undefined
}

const asId = (value: string | undefined) => (value && OBJECT_ID.test(value) ? value : undefined)

// A real calendar date, so ?from=2026-13-45 does not reach the backend as a 400.
function asDate(value: string | undefined) {
  if (!value || !DATE.test(value)) return undefined
  return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) ? undefined : value
}

// The URL is the source of truth for the history, so each value is checked: a hand-edited value means
// "no filter". An end date before the start date is dropped too (the backend refuses that range).
export function parseDistributionParams(raw: {
  page?: string
  camp?: string
  volunteer?: string
  from?: string
  to?: string
}): DistributionView {
  const page = Number(raw.page)
  const from = asDate(raw.from)
  const to = asDate(raw.to)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    camp: asId(raw.camp),
    volunteer: asId(raw.volunteer),
    from,
    to: from && to && to < from ? undefined : to,
  }
}

export function toDistributionQuery(view: DistributionView): DistributionListParams {
  return {
    page: view.page,
    limit: NGO_PAGE_SIZE,
    camp: view.camp,
    volunteer: view.volunteer,
    from: view.from,
    to: view.to,
  }
}

// The overview's list of the latest hand-outs.
export const RECENT_DISTRIBUTION_PARAMS: DistributionListParams = { limit: 5 }
