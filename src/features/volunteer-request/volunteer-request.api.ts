import { clientApi } from '@/lib/api/client'
import type { AdminVolunteerRequest, VolunteerRequest, VolunteerRequestListParams } from '@/types'

export const volunteerRequestApi = {
  // My own requests, newest first. A rejected one can be followed by a new request.
  mine: (signal?: AbortSignal) =>
    clientApi.getList<VolunteerRequest>('/volunteer-requests/me', { limit: 20 }, signal),
  // `message` is why I want to volunteer. 400 without a phone on the profile, 409 while one is pending.
  create: (message: string) => clientApi.post<VolunteerRequest>('/volunteer-requests', { message }),

  // Admin: every request, newest first, with who asked.
  list: (params: VolunteerRequestListParams, signal?: AbortSignal) =>
    clientApi.getList<AdminVolunteerRequest>('/volunteer-requests', params, signal),
  // Approving makes the applicant a volunteer at once (their role replaces `victim`). 409 when someone
  // else already reviewed it. The applicant is told, and the note goes with it.
  approve: (id: string, note?: string) =>
    clientApi.put<AdminVolunteerRequest>(`/volunteer-requests/${id}/approve`, note ? { note } : {}),
  reject: (id: string, note?: string) =>
    clientApi.put<AdminVolunteerRequest>(`/volunteer-requests/${id}/reject`, note ? { note } : {}),
}
