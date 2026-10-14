import { z } from 'zod'
import { VOLUNTEER_REQUEST_MAX_LENGTH, VOLUNTEER_REQUEST_MIN_LENGTH } from '@/lib/constants'

// Mirrors the backend (volunteer-request.interface.ts).
export const volunteerRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(
      VOLUNTEER_REQUEST_MIN_LENGTH,
      `Tell us why in at least ${VOLUNTEER_REQUEST_MIN_LENGTH} characters`,
    )
    .max(
      VOLUNTEER_REQUEST_MAX_LENGTH,
      `Message must be at most ${VOLUNTEER_REQUEST_MAX_LENGTH} characters`,
    ),
})

export type VolunteerRequestInput = z.input<typeof volunteerRequestSchema>
