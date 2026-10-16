import type { PaginationParams } from './api'
import type { Role, VolunteerRequestStatus } from './enums'

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

// GET /volunteer-requests (admin): each request carries who asked, with the contact details an admin needs
// to judge it. Approving makes the user a volunteer at once; rejecting leaves them a victim.
export type AdminVolunteerRequest = Omit<VolunteerRequest, 'reviewNote' | 'reviewedAt'> & {
  user: { id: string; name: string; email: string; phone: string | null; role: Role }
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNote: string | null
}

export type VolunteerRequestListParams = PaginationParams & {
  status?: VolunteerRequestStatus
}
