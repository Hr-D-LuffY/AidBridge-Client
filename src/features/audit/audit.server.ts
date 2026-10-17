import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AuditEntry, AuditListParams, Paginated } from '@/types'

// A page of the audit trail (GET /audit-logs, admin).
export function getAuditPage(params: AuditListParams): Promise<Paginated<AuditEntry>> {
  return serverApi.getList<AuditEntry>('/audit-logs', params)
}
