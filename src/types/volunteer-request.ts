import type { VolunteerRequestStatus } from './enums'

// POST /volunteer-requests and GET /volunteer-requests/me. The admin list adds the applicant (part 8).
export type VolunteerRequest = {
  id: string
  message: string
  status: VolunteerRequestStatus
  reviewNote?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
}
