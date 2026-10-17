import { clientApi } from '@/lib/api/client'
import type {
  CreateIncidentPayload,
  Incident,
  IncidentListParams,
  Priority,
  SosLinkAction,
  UpdateIncidentPayload,
} from '@/types'

export const incidentApi = {
  // Newest first. Readable by every signed-in user; only an admin can change anything.
  list: (params: IncidentListParams, signal?: AbortSignal) =>
    clientApi.getList<Incident>('/incidents', params, signal),
  // One incident. For admin and NGO it carries `sosRequests`, the ids of the linked requests.
  get: (id: string, signal?: AbortSignal) =>
    clientApi.get<Incident>(`/incidents/${id}`, undefined, signal),
  create: (payload: CreateIncidentPayload) => clientApi.post<Incident>('/incidents', payload),
  // Only what changed. `status: 'resolved'` stamps the end date; `active` clears it.
  update: (id: string, payload: UpdateIncidentPayload) =>
    clientApi.put<Incident>(`/incidents/${id}`, payload),
  setPriority: (id: string, priority: Priority) =>
    clientApi.put<Incident>(`/incidents/${id}/priority`, { priority }),
  // Soft delete: it leaves every list, and the requests linked to it are untouched.
  remove: (id: string) => clientApi.delete(`/incidents/${id}`),
  // Links or unlinks 1 to 50 requests. The answer is the incident with `sosRequests`, the ids linked now.
  linkRequests: (id: string, action: SosLinkAction, sosRequestIds: string[]) =>
    clientApi.put<Incident>(`/incidents/${id}/sos`, { action, sosRequestIds }),
}
