import { z } from 'zod'
import {
  CAMP_ADDRESS_MAX_LENGTH,
  CAMP_NAME_MAX_LENGTH,
  CAMP_NAME_MIN_LENGTH,
  MAX_CAMP_CAPACITY,
} from '@/lib/constants'

// Mirrors the backend's createCampSchema (camp.interface.ts). The two numbers are typed into text boxes,
// so they are strings here and become numbers when the form is sent. The camp's position is not a form
// field: it is the pin on the map, checked by the sheet before it sends.

const WHOLE_NUMBER = /^\d+$/

export const campSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(CAMP_NAME_MIN_LENGTH, `Name must be at least ${CAMP_NAME_MIN_LENGTH} characters`)
      .max(CAMP_NAME_MAX_LENGTH, `Name must be at most ${CAMP_NAME_MAX_LENGTH} characters`),
    address: z
      .string()
      .trim()
      .max(
        CAMP_ADDRESS_MAX_LENGTH,
        `Address must be at most ${CAMP_ADDRESS_MAX_LENGTH} characters`,
      ),
    capacity: z
      .string()
      .trim()
      .min(1, 'Enter how many people the camp holds')
      .refine((value) => WHOLE_NUMBER.test(value), 'Use a whole number')
      .refine((value) => Number(value) >= 1, 'The camp must hold at least 1 person')
      .refine(
        (value) => Number(value) <= MAX_CAMP_CAPACITY,
        `At most ${MAX_CAMP_CAPACITY.toLocaleString('en')} people`,
      ),
    // Blank means nobody is there yet. Only the "add camp" form shows it; after that the check-in
    // buttons on the camp's card change it.
    currentOccupancy: z
      .string()
      .trim()
      .refine((value) => value === '' || WHOLE_NUMBER.test(value), 'Use a whole number'),
    isActive: z.boolean(),
  })
  .refine(
    (camp) =>
      camp.currentOccupancy === '' ||
      !WHOLE_NUMBER.test(camp.capacity) ||
      !WHOLE_NUMBER.test(camp.currentOccupancy) ||
      Number(camp.currentOccupancy) <= Number(camp.capacity),
    { message: 'More people than the camp holds', path: ['currentOccupancy'] },
  )

export type CampInput = z.input<typeof campSchema>
