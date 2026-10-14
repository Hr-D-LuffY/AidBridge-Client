import { z } from 'zod'
import {
  SOS_ADDRESS_MAX_LENGTH,
  SOS_DESCRIPTION_MAX_LENGTH,
  SOS_RESOLVE_REASON_MAX_LENGTH,
} from '@/lib/constants'
import { ReliefCategory } from '@/types/enums'

// Mirror the backend's schemas (sos.interface.ts). The forms pass them to TanStack Form as the
// validator. Location and files are not here: they are not text fields (see raise-sos-form.tsx).

export const sosFieldsSchema = z.object({
  needs: z
    .array(z.enum(ReliefCategory))
    .min(1, 'Choose at least one need')
    .max(Object.keys(ReliefCategory).length),
  description: z
    .string()
    .trim()
    .max(
      SOS_DESCRIPTION_MAX_LENGTH,
      `Details must be at most ${SOS_DESCRIPTION_MAX_LENGTH} characters`,
    ),
  address: z
    .string()
    .trim()
    .max(SOS_ADDRESS_MAX_LENGTH, `Address must be at most ${SOS_ADDRESS_MAX_LENGTH} characters`),
})

export type SosFieldsInput = z.input<typeof sosFieldsSchema>

export const resolveReasonSchema = z
  .string()
  .trim()
  .min(1, 'Please say why')
  .max(SOS_RESOLVE_REASON_MAX_LENGTH, `At most ${SOS_RESOLVE_REASON_MAX_LENGTH} characters`)
