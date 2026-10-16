'use client'

import { useId } from 'react'

type SelectFilterProps = {
  label: string
  options: readonly { value: string; label: string }[]
  // undefined means "all".
  value: string | undefined
  onChange: (value: string | undefined) => void
  // The first choice, which clears the filter ("All camps").
  allLabel: string
  disabled?: boolean
}

// A labelled native dropdown for a list's filter, for choices that are too many for chips (one of the
// NGO's camps, one volunteer). The caller keeps the value in the URL (see useQueryParams).
export function SelectFilter({
  label,
  options,
  value,
  onChange,
  allLabel,
  disabled,
}: SelectFilterProps) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="h-11 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:[&>option]:bg-card"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
