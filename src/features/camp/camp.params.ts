import { DEFAULT_PAGE, MAX_PAGE_SIZE, NGO_PAGE_SIZE } from '@/lib/constants'
import type { CampListParams, MyCampsParams } from '@/types'

// A volunteer is assigned to a handful of camps, so the camps page and the hand-out form both read the
// first 100 once. Sharing the parameters shares the cache: stock changed in one shows in the other.
export const MY_CAMPS_PARAMS: MyCampsParams = { limit: MAX_PAGE_SIZE }

// The camps page of an NGO lists a page at a time; its page lives in the URL.
export function toManagedCampsQuery(rawPage: string | undefined): CampListParams {
  const page = Number(rawPage)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    limit: NGO_PAGE_SIZE,
  }
}

// Every camp of the NGO, for the places that pick one (the stock form, the stock and hand-out filters).
export const CAMP_OPTIONS_PARAMS: CampListParams = { limit: MAX_PAGE_SIZE }
