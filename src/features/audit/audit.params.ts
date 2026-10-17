import { ADMIN_PAGE_SIZE, DEFAULT_PAGE } from '@/lib/constants'
import { AuditAction, type AuditListParams, AuditTargetType } from '@/types'

const OBJECT_ID = /^[0-9a-f]{24}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const ACTIONS = Object.values(AuditAction)
const TARGET_TYPES = Object.values(AuditTargetType)

export type AuditView = {
  page: number
  actor: string | undefined
  action: AuditAction | undefined
  type: AuditTargetType | undefined
  // yyyy-mm-dd, as a date input gives them.
  from: string | undefined
  to: string | undefined
}

// A real calendar date, so ?from=2026-13-45 does not reach the backend as a 400.
function asDate(value: string | undefined) {
  if (!value || !DATE.test(value)) return undefined
  return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) ? undefined : value
}

// The URL is the source of truth, so each value is checked: a hand-edited value means "no filter". An end
// date before the start date is dropped too (the backend refuses that range).
export function parseAuditParams(raw: {
  page?: string
  actor?: string
  action?: string
  type?: string
  from?: string
  to?: string
}): AuditView {
  const page = Number(raw.page)
  const from = asDate(raw.from)
  const to = asDate(raw.to)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    actor: raw.actor && OBJECT_ID.test(raw.actor) ? raw.actor : undefined,
    action: ACTIONS.find((action) => action === raw.action),
    type: TARGET_TYPES.find((type) => type === raw.type),
    from,
    to: from && to && to < from ? undefined : to,
  }
}

export function toAuditQuery(view: AuditView): AuditListParams {
  return {
    page: view.page,
    limit: ADMIN_PAGE_SIZE,
    actor: view.actor,
    action: view.action,
    targetType: view.type,
    from: view.from,
    to: view.to,
  }
}
