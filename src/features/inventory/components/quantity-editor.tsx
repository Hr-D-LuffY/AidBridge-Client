'use client'

import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InventoryItem } from '@/types'
import { useSetQuantity } from '../inventory.queries'
import { amountSchema } from '../inventory.schema'

// The amount in stock, editable in the row: type a new amount and press Save (or Enter). It shows at once
// and goes back if the server refuses. Nothing here says whether the item is low: the backend works that
// out, and the row's badge changes when the list is read again right after.
export function QuantityEditor({ item }: { item: InventoryItem }) {
  const setQuantity = useSetQuantity()
  const id = useId()
  // null means "untouched": show what is in stock. Typing starts a draft; saving or a refusal ends it.
  const [draft, setDraft] = useState<string | null>(null)

  const value = draft ?? String(item.quantity)
  const parsed = amountSchema('an amount').safeParse(value)
  const dirty = draft !== null && draft.trim() !== String(item.quantity)
  const error = dirty && !parsed.success ? parsed.error.issues[0]?.message : undefined

  function save() {
    if (!dirty || !parsed.success) return
    setQuantity.mutate({ id: item.id, quantity: Number(parsed.data) })
    setDraft(null)
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="sr-only">
          Amount of {item.itemName} in stock, in {item.unit}
        </label>
        <Input
          id={id}
          value={value}
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => setDraft(event.target.value)}
          className="h-10 w-24 text-base tabular-nums md:text-sm"
        />
        <span className="text-sm text-muted-foreground">{item.unit}</span>
        {dirty && (
          <Button
            type="submit"
            variant="outline"
            className="h-10 gap-1.5 px-3"
            disabled={!parsed.success}
          >
            <Check aria-hidden="true" />
            Save
            <span className="sr-only"> amount of {item.itemName}</span>
          </Button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}
