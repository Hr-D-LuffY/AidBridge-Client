import 'server-only'
import { serverApi } from '@/lib/api/server'
import type {
  NearbySos,
  NearbySosParams,
  Paginated,
  SosListParams,
  SosRequest,
  SosStatus,
  SosView,
} from '@/types'

// The same endpoints for Server Components, which call the backend directly.
export function getSosPage(params: SosListParams): Promise<Paginated<SosRequest>> {
  return serverApi.getList<SosRequest>('/sos', params)
}

export function getSos(id: string): Promise<SosRequest> {
  return serverApi.get<SosRequest>(`/sos/${id}`)
}

// A volunteer reads a request in whichever view the backend allows: the limited one while it is
// pending, the full one once it is theirs (see isFullSos).
export function getSosView(id: string): Promise<SosView> {
  return serverApi.get<SosView>(`/sos/${id}`)
}

// Pending requests around a point, nearest first (volunteers).
export function getNearbySosPage(params: NearbySosParams): Promise<Paginated<NearbySos>> {
  return serverApi.getList<NearbySos>('/sos/nearby', params)
}

// How many of my requests have this status (only the `meta.total` is read).
export async function countSos(status: SosStatus): Promise<number> {
  const { meta } = await serverApi.getList<SosRequest>('/sos', { status, limit: 1 })
  return meta.total
}
