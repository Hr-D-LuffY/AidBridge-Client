'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/input'

type DateFilterProps = {
  label: string
  // yyyy-mm-dd, as a date input gives it; undefined means no limit.
  value: string | undefined
  min?: string
  max?: string
  onChange: (value: string | undefined) => void
}

// A labelled date input for a list's filter. The caller keeps the value in the URL (see useQueryParams)
// and passes the other end of the range as `min` / `max`.
export function DateFilter({ label, value, min, max, onChange }: DateFilterProps) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="date"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="h-11 text-base md:text-sm"
      />
    </div>
  )
}
