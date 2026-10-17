'use client'

import { cn } from '@/lib/utils'

type MultiFilterChipsProps<T extends string> = {
  label: string
  // `swatch`: classes for a small round colour sample before the label, for options whose colour means something elsewhere on the page.
  options: readonly { value: T; label: string; swatch?: string }[]
  // The chosen values; empty means "All".
  value: readonly T[]
  onChange: (value: T[]) => void
  allLabel?: string
}

// A row of filter buttons where several can be on at once (the list then matches any of them). "All"
// clears the choice. The caller keeps the value in the URL (see useQueryParams).
export function MultiFilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel = 'All',
}: MultiFilterChipsProps<T>) {
  const chipClass = (selected: boolean) =>
    cn(
      'min-h-9 cursor-pointer rounded-full border px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11',
      selected
        ? 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
        : 'border-input bg-card hover:bg-muted',
    )

  return (
    <fieldset className="flex min-w-0 flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="mr-1 text-sm text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        aria-pressed={value.length === 0}
        onClick={() => onChange([])}
        className={chipClass(value.length === 0)}
      >
        {allLabel}
      </button>
      {options.map((option) => {
        const selected = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onChange(
                selected
                  ? value.filter((item) => item !== option.value)
                  : options
                      .map((o) => o.value)
                      .filter((v) => v === option.value || value.includes(v)),
              )
            }
            className={chipClass(selected)}
          >
            {option.swatch && (
              <span
                aria-hidden="true"
                className={cn(
                  'mr-2 inline-block size-4 rounded-full border align-text-bottom',
                  option.swatch,
                )}
              />
            )}
            {option.label}
          </button>
        )
      })}
    </fieldset>
  )
}
