import { clientApi } from '@/lib/api/client'
import type { AuditEntry, AuditListParams } from '@/types'

export const auditApi = {
  // Admin: who did what to whose data, newest first. Read only; nobody can edit or delete an entry.
  list: (params: AuditListParams, signal?: AbortSignal) =>
    clientApi.getList<AuditEntry>('/audit-logs', params, signal),
}
