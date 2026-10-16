import { clientApi } from '@/lib/api/client'
import { uploadWithProgress } from '@/lib/api/upload'
import type {
  AcceptSosResult,
  CreateSosPayload,
  NearbySos,
  NearbySosParams,
  Priority,
  RejectSosResult,
  SosListParams,
  SosRequest,
  UpdateSosPayload,
} from '@/types'

// One function per endpoint, for the browser (through the BFF). Server pages use sos.server.ts.
export const sosApi = {
  list: (params: SosListParams, signal?: AbortSignal) =>
    clientApi.getList<SosRequest>('/sos', params, signal),
  get: (id: string, signal?: AbortSignal) =>
    clientApi.get<SosRequest>(`/sos/${id}`, undefined, signal),
  create: (payload: CreateSosPayload) => clientApi.post<SosRequest>('/sos', payload),
  // Only the fields that changed: the backend refuses an empty body and unknown fields.
  update: (id: string, payload: UpdateSosPayload) =>
    clientApi.put<SosRequest>(`/sos/${id}`, payload),
  resolve: (id: string, resolveReason: string) =>
    clientApi.put<SosRequest>(`/sos/${id}/resolve`, { resolveReason }),
  // Adds 1 to 5 files (field name `media`) and answers with the whole request.
  addMedia: (id: string, files: File[], onProgress: (percent: number) => void) => {
    const body = new FormData()
    for (const file of files) body.append('media', file)
    return uploadWithProgress<SosRequest>(`/sos/${id}/media`, body, onProgress)
  },

  // Volunteers. Pending requests around a point, nearest first, in the limited view (no phone, no
  // street address, no photos).
  nearby: (params: NearbySosParams, signal?: AbortSignal) =>
    clientApi.getList<NearbySos>('/sos/nearby', params, signal),
  // Takes the request: 200 with the full view and the new task, or 409 (taken meanwhile, three active
  // tasks already, or declined earlier).
  accept: (id: string) => clientApi.put<AcceptSosResult>(`/sos/${id}/accept`),
  // "No thanks" on a request that is not yours, or backing out of one you accepted but have not set off on.
  reject: (id: string) => clientApi.put<RejectSosResult>(`/sos/${id}/reject`),

  // Admin: how urgent the request is. Volunteers see it in the order of urgency on their map.
  setPriority: (id: string, priority: Priority) =>
    clientApi.put<SosRequest>(`/sos/${id}/priority`, { priority }),
}
