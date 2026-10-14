'use client'

import { ReliefPicker } from '@/components/shared/relief-category'
import type { ReliefCategory } from '@/types/enums'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

// "What do you need?": the relief picker bound to the surrounding form field.
export function NeedsField({ label }: { label: string }) {
  const field = useFieldContext<ReliefCategory[]>()
  const error = getFieldError(field)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-semibold">{label}</p>
      <ReliefPicker
        legend={label}
        value={field.state.value}
        onChange={field.handleChange}
        onBlur={field.handleBlur}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
