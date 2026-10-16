'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { RELIEF_CATEGORY_OPTIONS } from '@/components/shared/relief-category'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCampOptionsQuery } from '@/features/camp/camp.queries'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { ITEM_NAME_MAX_LENGTH, ITEM_UNIT_MAX_LENGTH } from '@/lib/constants'
import type { InventoryItem, ReliefCategory, UpdateInventoryPayload } from '@/types'
import { useCreateItem, useUpdateItem } from '../inventory.queries'
import { type ItemInput, itemSchema, NEW_ITEM_DEFAULTS } from '../inventory.schema'

const FIELD_NAMES = [
  'itemName',
  'category',
  'quantity',
  'unit',
  'lowStockThreshold',
  'camp',
] as const

type ItemFormSheetProps = {
  // The item being edited, or null to add a new one.
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toDefaults(item: InventoryItem | null): ItemInput {
  if (!item) return NEW_ITEM_DEFAULTS
  return {
    itemName: item.itemName,
    category: item.category,
    quantity: String(item.quantity),
    unit: item.unit,
    lowStockThreshold: String(item.lowStockThreshold),
    camp: item.camp?.id ?? '',
  }
}

// Add a stock item, or change one. Editing sends only the fields that changed (the backend refuses an
// empty update). Whether the item counts as low is worked out by the backend from the amount and the
// low-stock level, so this form never says it. Mount it only while it is open, so it starts fresh.
export function ItemFormSheet({ item, open, onOpenChange }: ItemFormSheetProps) {
  const create = useCreateItem()
  const update = useUpdateItem(item?.id ?? '')
  const camps = useCampOptionsQuery(open)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: toDefaults(item),
    validators: { onChange: itemSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      const fields = itemSchema.parse(value)
      const category = fields.category as ReliefCategory
      const quantity = Number(fields.quantity)
      const lowStockThreshold = Number(fields.lowStockThreshold)

      try {
        if (!item) {
          await create.mutateAsync({
            itemName: fields.itemName,
            category,
            quantity,
            unit: fields.unit,
            lowStockThreshold,
            ...(fields.camp && { camp: fields.camp }),
          })
        } else {
          const changes: UpdateInventoryPayload = {}
          if (fields.itemName !== item.itemName) changes.itemName = fields.itemName
          if (category !== item.category) changes.category = category
          if (quantity !== item.quantity) changes.quantity = quantity
          if (fields.unit !== item.unit) changes.unit = fields.unit
          if (lowStockThreshold !== item.lowStockThreshold) {
            changes.lowStockThreshold = lowStockThreshold
          }
          if (fields.camp !== (item.camp?.id ?? '')) changes.camp = fields.camp || null

          if (Object.keys(changes).length === 0) {
            toast.info('Nothing was changed.')
            onOpenChange(false)
            return
          }
          await update.mutateAsync(changes)
        }
        onOpenChange(false)
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{item ? 'Edit stock item' : 'Add stock item'}</SheetTitle>
          <SheetDescription>
            {item
              ? 'Change what you hold. Volunteers hand out from the camp the item is kept in.'
              : 'Add something you hold. Put it in a camp so the volunteers assigned there can hand it out.'}
          </SheetDescription>
        </SheetHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-5 p-4"
        >
          <form.AppField name="itemName">
            {(field) => (
              <field.TextField
                label="Item"
                placeholder="For example Rice"
                maxLength={ITEM_NAME_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <form.AppField name="category">
            {(field) => (
              <field.SelectField
                label="Category"
                placeholder="Choose a category"
                options={RELIEF_CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label }))}
              />
            )}
          </form.AppField>

          <div className="grid grid-cols-2 gap-3">
            <form.AppField name="quantity">
              {(field) => (
                <field.TextField
                  label="In stock"
                  inputMode="decimal"
                  placeholder="For example 50"
                />
              )}
            </form.AppField>
            <form.AppField name="unit">
              {(field) => (
                <field.TextField
                  label="Unit"
                  placeholder="kg, packs, litres"
                  maxLength={ITEM_UNIT_MAX_LENGTH}
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="lowStockThreshold">
            {(field) => (
              <field.TextField
                label="Running low at"
                inputMode="decimal"
                hint="The item is flagged as running low when the amount in stock is this or less."
              />
            )}
          </form.AppField>

          <form.AppField name="camp">
            {(field) => (
              <field.SelectField
                label="Kept in camp"
                optional
                placeholder="No camp (general store)"
                disabled={camps.isPending}
                options={(camps.data?.items ?? []).map((camp) => ({
                  value: camp.id,
                  label: camp.isActive ? camp.name : `${camp.name} (closed)`,
                }))}
                hint={
                  camps.isError
                    ? 'Your camps could not be loaded. Try again in a moment.'
                    : camps.data?.items.length === 0
                      ? 'You have no camps yet. Add a camp first to keep stock in it.'
                      : undefined
                }
              />
            )}
          </form.AppField>

          <FormError message={serverError} />

          <form.AppForm>
            <form.SubmitButton>{item ? 'Save changes' : 'Add to stock'}</form.SubmitButton>
          </form.AppForm>
        </form>
      </SheetContent>
    </Sheet>
  )
}
