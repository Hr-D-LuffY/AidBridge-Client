import { z } from 'zod'
import {
  SOS_ADDRESS_MAX_LENGTH,
  SOS_DESCRIPTION_MAX_LENGTH,
  SOS_RESOLVE_REASON_MAX_LENGTH,
} from '@/lib/constants'
import { MAX_REQUIRED_SKILLS } from '@/lib/skills'
import { ReliefCategory, Skill } from '@/types/enums'

// Mirror the backend's schemas (sos.interface.ts). The forms pass them to TanStack Form as the
// validator. Location and files are not here: they are not text fields (see raise-sos-form.tsx).

export const sosFieldsSchema = z.object({
  needs: z
    .array(z.enum(ReliefCategory))
    .min(1, 'Choose at least one need')
    .max(Object.keys(ReliefCategory).length),
  // Optional "special help": it never blocks sending.
  requiredSkills: z
    .array(z.enum(Skill))
    .max(MAX_REQUIRED_SKILLS, `Choose at most ${MAX_REQUIRED_SKILLS} kinds of special help`),
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
