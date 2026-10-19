import { clientApi } from '@/lib/api/client'
import type {
  AssignPayload,
  CandidatesParams,
  DispatchCandidate,
  DispatchRunResult,
  DispatchSettingsResult,
  SosRequest,
  UnassignPayload,
  UpdateDispatchSettingsPayload,
} from '@/types'

// One function per endpoint, for the browser (through the BFF). All of them are admin only. Server pages use
// dispatch.server.ts.
export const dispatchApi = {
  settings: (signal?: AbortSignal) =>
    clientApi.get<DispatchSettingsResult>('/dispatch/settings', undefined, signal),
  // Only what changes. A 400 names the field; a 409 means another admin saved first.
  updateSettings: (payload: UpdateDispatchSettingsPayload) =>
    clientApi.put<DispatchSettingsResult>('/dispatch/settings', payload),

  // Who the engine could pick for a request, best first (the nearest 50 inside the radius).
  candidates: (sosId: string, params: CandidatesParams, signal?: AbortSignal) =>
    clientApi.getList<DispatchCandidate>(`/sos/${sosId}/candidates`, params, signal),
  // An offer by default; `direct: true` gives the request to the volunteer at once.
  assign: (sosId: string, payload: AssignPayload) =>
    clientApi.put<SosRequest>(`/sos/${sosId}/assign`, payload),
  // Takes the request back from its volunteer; it goes back to pending.
  unassign: (sosId: string, payload: UnassignPayload) =>
    clientApi.put<SosRequest>(`/sos/${sosId}/unassign`, payload),
  // Runs the next engine step now, skipping the wait.
  runNow: (sosId: string) => clientApi.post<DispatchRunResult>(`/sos/${sosId}/dispatch`),
  pause: (sosId: string) => clientApi.put<SosRequest>(`/sos/${sosId}/dispatch/pause`),
  resume: (sosId: string) => clientApi.put<SosRequest>(`/sos/${sosId}/dispatch/resume`),
}
