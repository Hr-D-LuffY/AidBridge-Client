import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { CampSummary } from '@/types'

// One active camp (GET /camps/:id), for the camp's own page.
export function getCamp(id: string): Promise<CampSummary> {
  return serverApi.get<CampSummary>(`/camps/${id}`)
}
