import type { PaginationParams } from './api'
import type { ReliefCategory } from './enums'

// POST /distribution. The recipient is always the task's victim and the time is the server's, so
// neither is sent; any other field is a 400.
export type CreateDistributionPayload = {
  taskId: string
  campId: string
  inventoryItemId: string
  quantity: number
  notes?: string
}

// One hand-out. The item is a copy, so it stays right if the stock item is renamed or deleted later.
export type Distribution = {
  id: string
  camp: { id: string; name: string; address: string | null }
  sosRequest: string
  task: string
  volunteer: { id: string; name: string; phone: string | null }
  recipient: { id: string; name: string }
  item: {
    id: string
    itemName: string
    category: ReliefCategory
    quantity: number
    unit: string
  }
  notes: string | null
  distributedAt: string
}

// GET /distribution (NGO: its own camps' hand-outs, admin: all). `from` and `to` are dates (yyyy-mm-dd);
// a bare `to` covers that whole day.
export type DistributionListParams = PaginationParams & {
  camp?: string
  volunteer?: string
  from?: string
  to?: string
}
