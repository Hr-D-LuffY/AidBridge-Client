import { format } from 'date-fns'
import { z } from 'zod'
import {
  INCIDENT_ADDRESS_MAX_LENGTH,
  INCIDENT_DESCRIPTION_MAX_LENGTH,
  INCIDENT_TITLE_MAX_LENGTH,
  INCIDENT_TITLE_MIN_LENGTH,
} from '@/lib/constants'
import { DisasterType } from '@/types'

// Mirrors the backend's createIncidentSchema (incident.interface.ts). The incident's position is not a
// form field: it is the pin on the map, checked by the sheet before it sends. Priority and status have
// their own buttons on the incident's page.

const DISASTERS = Object.values(DisasterType)

export const incidentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      INCIDENT_TITLE_MIN_LENGTH,
      `Title must be at least ${INCIDENT_TITLE_MIN_LENGTH} characters`,
    )
    .max(
      INCIDENT_TITLE_MAX_LENGTH,
      `Title must be at most ${INCIDENT_TITLE_MAX_LENGTH} characters`,
    ),
  disasterType: z
    .string()
    .refine((value) => DISASTERS.some((type) => type === value), 'Choose the kind of disaster'),
  address: z
    .string()
    .trim()
    .max(
      INCIDENT_ADDRESS_MAX_LENGTH,
      `Address must be at most ${INCIDENT_ADDRESS_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      INCIDENT_DESCRIPTION_MAX_LENGTH,
      `Description must be at most ${INCIDENT_DESCRIPTION_MAX_LENGTH} characters`,
    ),
  // A date input gives yyyy-mm-dd, and an empty one gives ''.
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose the start date'),
})

export type IncidentInput = z.input<typeof incidentSchema>

export const todayInputValue = () => format(new Date(), 'yyyy-MM-dd')
