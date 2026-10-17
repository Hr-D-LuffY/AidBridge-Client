import type { PaginationParams } from './api'
import type { AuditAction, AuditTargetType, Role } from './enums'

// One line of the audit trail (GET /audit-logs, admin only). `actor` is null for an entry the system
// wrote; `actor.name` is null when that account no longer exists. `actorRole` is the role the actor had
// at the time. `action` is a plain string because later steps add values (see AuditAction). `summary` is
// a human sentence without passwords, tokens or phone numbers, and is shown as plain text. `meta` keys
// depend on `action`; every key is optional.
export type AuditEntry = {
  id: string
  actor: { id: string; name: string | null } | null
  actorRole: Role | null
  action: AuditAction | (string & {})
  targetType: AuditTargetType | (string & {})
  targetId: string
  summary: string
  meta: Record<string, unknown>
  createdAt: string
}

// GET /audit-logs. `from` and `to` are dates (yyyy-mm-dd); a bare `to` covers that whole day.
export type AuditListParams = PaginationParams & {
  actor?: string
  action?: AuditAction
  targetType?: AuditTargetType
  from?: string
  to?: string
}
