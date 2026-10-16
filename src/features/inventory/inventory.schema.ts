import { z } from 'zod'
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_STOCK_UNIT,
  ITEM_NAME_MAX_LENGTH,
  ITEM_UNIT_MAX_LENGTH,
  MAX_STOCK_QUANTITY,
} from '@/lib/constants'
import { ReliefCategory } from '@/types'

// Mirrors the backend's createItemSchema (inventory.interface.ts). Amounts are typed into text boxes, so
// they are strings here and become numbers when the form is sent. They may be fractions (2.5 kg) but
// never negative.

export const CATEGORY_VALUES = Object.values(ReliefCategory)

export const amountSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}`)
    .refine((value) => Number.isFinite(Number(value)), 'Enter a number')
    .refine((value) => Number(value) >= 0, 'It cannot be negative')
    .refine((value) => Number(value) <= MAX_STOCK_QUANTITY, 'That amount is too large')

export const itemSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, 'Enter what the item is')
    .max(ITEM_NAME_MAX_LENGTH, `Name must be at most ${ITEM_NAME_MAX_LENGTH} characters`),
  category: z
    .string()
    .refine((value) => CATEGORY_VALUES.some((category) => category === value), 'Choose a category'),
  quantity: amountSchema('the amount in stock'),
  unit: z
    .string()
    .trim()
    .min(1, 'Enter a unit, for example kg or packs')
    .max(ITEM_UNIT_MAX_LENGTH, `Unit must be at most ${ITEM_UNIT_MAX_LENGTH} characters`),
  lowStockThreshold: amountSchema('the low-stock level'),
  // The id of the camp the stock is kept in, or '' for the NGO's general store.
  camp: z.string(),
})

export type ItemInput = z.input<typeof itemSchema>

export const NEW_ITEM_DEFAULTS: ItemInput = {
  itemName: '',
  category: '',
  quantity: '',
  unit: DEFAULT_STOCK_UNIT,
  lowStockThreshold: String(DEFAULT_LOW_STOCK_THRESHOLD),
  camp: '',
}
