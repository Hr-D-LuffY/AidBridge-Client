import { clientApi } from '@/lib/api/client'
import type { VolunteerRequest } from '@/types'

export const volunteerRequestApi = {
  // My own requests, newest first. A rejected one can be followed by a new request.
  mine: (signal?: AbortSignal) =>
    clientApi.getList<VolunteerRequest>('/volunteer-requests/me', { limit: 20 }, signal),
  // `message` is why I want to volunteer. 400 without a phone on the profile, 409 while one is pending.
  create: (message: string) => clientApi.post<VolunteerRequest>('/volunteer-requests', { message }),
}
