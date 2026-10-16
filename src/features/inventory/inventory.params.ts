import { DEFAULT_PAGE, NGO_PAGE_SIZE } from '@/lib/constants'
import { type InventoryListParams, ReliefCategory } from '@/types'

const CATEGORIES = Object.values(ReliefCategory)
const OBJECT_ID = /^[0-9a-f]{24}$/

export type InventoryView = {
  page: number
  camp: string | undefined
  category: ReliefCategory | undefined
  // Show only the items at or below their low-stock threshold.
  lowOnly: boolean
}

// The URL is the source of truth for the stock list, so each value is checked: a hand-edited
// ?category=nope or ?camp=abc means "no filter" instead of reaching the backend as a 400.
export function parseInventoryParams(raw: {
  page?: string
  camp?: string
  category?: string
  low?: string
}): InventoryView {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    camp: raw.camp && OBJECT_ID.test(raw.camp) ? raw.camp : undefined,
    category: CATEGORIES.find((category) => category === raw.category),
    lowOnly: raw.low === '1',
  }
}

export function toInventoryQuery(view: InventoryView): InventoryListParams {
  return {
    page: view.page,
    limit: NGO_PAGE_SIZE,
    camp: view.camp,
    category: view.category,
    isLow: view.lowOnly ? true : undefined,
  }
}

// The overview's list of low items.
export const LOW_STOCK_PARAMS = { limit: 5 }
