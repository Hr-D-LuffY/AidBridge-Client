'use client'

import { cn } from '@/lib/utils'

type FilterChipsProps<T extends string> = {
  label: string
  // `swatch`: classes for a small round colour sample before the label, for options whose colour means something elsewhere on the page.
  options: readonly { value: T; label: string; swatch?: string }[]
  // undefined means "All".
  value: T | undefined
  onChange: (value: T | undefined) => void
  allLabel?: string
  // Hide the "All" choice when one option must always be selected (a radius).
  hideAll?: boolean
}

// A row of single-choice filter buttons with an "All" first. The caller keeps the value in the URL
// (see useQueryParams), so a refresh or a shared link shows the same list.
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel = 'All',
  hideAll = false,
}: FilterChipsProps<T>) {
  const all: { value: T | undefined; label: string; swatch?: string }[] = hideAll
    ? [...options]
    : [{ value: undefined, label: allLabel }, ...options]

  return (
    <fieldset className="flex min-w-0 flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="mr-1 text-sm text-muted-foreground">
        {label}
      </span>
      {all.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value ?? 'all'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-9 cursor-pointer rounded-full border px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11',
              selected
                ? 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
                : 'border-input bg-card hover:bg-muted',
            )}
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
