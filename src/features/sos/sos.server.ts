import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Paginated, SosListParams, SosRequest, SosStatus } from '@/types'

// The same endpoints for Server Components, which call the backend directly.
export function getSosPage(params: SosListParams): Promise<Paginated<SosRequest>> {
  return serverApi.getList<SosRequest>('/sos', params)
}

export function getSos(id: string): Promise<SosRequest> {
  return serverApi.get<SosRequest>(`/sos/${id}`)
}

// How many of my requests have this status (only the `meta.total` is read).
export async function countSos(status: SosStatus): Promise<number> {
  const { meta } = await serverApi.getList<SosRequest>('/sos', { status, limit: 1 })
  return meta.total
}
