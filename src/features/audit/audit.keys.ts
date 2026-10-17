import type { AuditListParams } from '@/types'

// One key factory for the audit log. Plain module: the server page imports it too.
export const auditKeys = {
  all: ['audit'] as const,
  list: (params: AuditListParams) => [...auditKeys.all, 'list', params] as const,
}
