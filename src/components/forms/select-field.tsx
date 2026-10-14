'use client'

import { useId } from 'react'
import { FieldShell, getDescribedBy } from './field-shell'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

type SelectFieldProps = {
  label: string
  options: readonly { value: string; label: string }[]
  // The first, empty choice ("Choose a camp"). The field is invalid until something else is picked.
  placeholder: string
  disabled?: boolean
  optional?: boolean
  hint?: string
  // Runs after the user picks something (to clear a field that depends on this one).
  onValueChange?: (value: string) => void
}

// A native dropdown bound to the surrounding form field. Native on purpose: it is the picker people
// already know on a phone, and it works with the keyboard and screen readers without extra code.
export function SelectField({
  label,
  options,
  placeholder,
  disabled,
  optional,
  hint,
  onValueChange,
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const id = useId()
  const error = getFieldError(field)

  return (
    <FieldShell id={id} label={label} error={error} optional={optional} hint={hint}>
      <select
        id={id}
        name={field.name}
        value={field.state.value}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value)
          onValueChange?.(event.target.value)
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={getDescribedBy(id, error, hint)}
        className="h-12 w-full cursor-pointer rounded-xl border border-input bg-transparent px-3 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:[&>option]:bg-card"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
