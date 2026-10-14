import { MAX_PAGE_SIZE } from '@/lib/constants'
import type { MyCampsParams } from '@/types'

// A volunteer is assigned to a handful of camps, so the camps page and the hand-out form both read the
// first 100 once. Sharing the parameters shares the cache: stock changed in one shows in the other.
export const MY_CAMPS_PARAMS: MyCampsParams = { limit: MAX_PAGE_SIZE }
