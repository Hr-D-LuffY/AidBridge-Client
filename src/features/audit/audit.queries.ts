'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { AuditListParams } from '@/types'
import { auditApi } from './audit.api'
import { auditKeys } from './audit.keys'

// A page of the audit trail. The filters and page live in the URL, so a change keeps the old rows on
// screen until the new ones arrive.
export function useAuditLogQuery(params: AuditListParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: ({ signal }) => auditApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}
