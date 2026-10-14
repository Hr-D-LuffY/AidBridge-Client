import { z } from 'zod'
import { DISTRIBUTION_NOTES_MAX_LENGTH, MAX_STOCK_QUANTITY } from '@/lib/constants'

// Mirrors the backend's createDistributionSchema (distribution.interface.ts). The amount is typed into
// a text box, so it is a string here and becomes a number when the form is sent. The three choices
// are ids picked from lists, so they only need to be filled in.

export const handOutSchema = z.object({
  taskId: z.string().min(1, 'Choose who you are helping'),
  campId: z.string().min(1, 'Choose a camp'),
  inventoryItemId: z.string().min(1, 'Choose an item'),
  quantity: z
    .string()
    .trim()
    .min(1, 'Enter an amount')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Enter an amount above zero',
    })
    .refine((value) => Number(value) <= MAX_STOCK_QUANTITY, {
      message: 'That amount is too large',
    }),
  notes: z
    .string()
    .trim()
    .max(
      DISTRIBUTION_NOTES_MAX_LENGTH,
      `Notes must be at most ${DISTRIBUTION_NOTES_MAX_LENGTH} characters`,
    ),
})

export type HandOutInput = z.input<typeof handOutSchema>
