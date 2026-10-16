'use client'

import { Check, Droplets, type LucideIcon, Pill, Plus, Shirt, Tent, Utensils } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getReliefLabel, RELIEF_LABEL } from '@/lib/relief'
import { cn } from '@/lib/utils'
import { ReliefCategory } from '@/types/enums'

// Server Components cannot call functions from this client file, so the labels live in lib/relief.ts.
export { getReliefLabel }

// The six kinds of relief, shared by SOS "needs" and inventory categories: one label and icon each.
export const RELIEF_CATEGORY_OPTIONS: readonly {
  value: ReliefCategory
  label: string
  icon: LucideIcon
}[] = [
  { value: ReliefCategory.FOOD, label: RELIEF_LABEL.food, icon: Utensils },
  { value: ReliefCategory.MEDICINE, label: RELIEF_LABEL.medicine, icon: Pill },
  { value: ReliefCategory.SHELTER, label: RELIEF_LABEL.shelter, icon: Tent },
  { value: ReliefCategory.WATER, label: RELIEF_LABEL.water, icon: Droplets },
  { value: ReliefCategory.CLOTHING, label: RELIEF_LABEL.clothing, icon: Shirt },
  { value: ReliefCategory.OTHER, label: RELIEF_LABEL.other, icon: Plus },
]

const OPTION_BY_VALUE = new Map(RELIEF_CATEGORY_OPTIONS.map((option) => [option.value, option]))

// "Food, Water and Shelter", for a sentence or a table cell.
export function formatReliefList(categories: readonly ReliefCategory[]) {
  return categories.map(getReliefLabel).join(', ')
}

// The needs of one request as small pills.
export function ReliefBadges({
  categories,
  className,
}: {
  categories: readonly ReliefCategory[]
  className?: string
}) {
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {categories.map((category) => {
        const Icon = OPTION_BY_VALUE.get(category)?.icon ?? Plus
        return (
          <li key={category}>
            <Badge variant="outline" className="h-6 gap-1 px-2">
              <Icon aria-hidden="true" />
              {getReliefLabel(category)}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

const SELECTED = 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
const UNSELECTED = 'border-input bg-card hover:bg-muted'

type ReliefPickerProps = {
  legend: string
  value: ReliefCategory[]
  onChange: (next: ReliefCategory[]) => void
  onBlur?: () => void
  disabled?: boolean
  // chips: a wrapping row of pills. grid: three tiles across, icon over label.
  variant?: 'chips' | 'grid'
}

// Several can be chosen. A tick appears on the chosen ones, so the state never relies on colour.
export function ReliefPicker({
  legend,
  value,
  onChange,
  onBlur,
  disabled,
  variant = 'chips',
}: ReliefPickerProps) {
  function toggle(category: ReliefCategory) {
    onChange(
      value.includes(category) ? value.filter((item) => item !== category) : [...value, category],
    )
    onBlur?.()
  }

  return (
    <fieldset
      disabled={disabled}
      className={cn(
        'min-w-0',
        variant === 'chips' ? 'flex flex-wrap gap-2' : 'grid grid-cols-3 gap-2.5',
      )}
    >
      <legend className="sr-only">{legend}</legend>
      {RELIEF_CATEGORY_OPTIONS.map(({ value: category, label, icon: Icon }) => {
        const selected = value.includes(category)
        return (
          <button
            key={category}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(category)}
            className={cn(
              'relative inline-flex cursor-pointer items-center border font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
              selected ? SELECTED : UNSELECTED,
              variant === 'chips'
                ? 'min-h-11 gap-2 rounded-full px-4 text-sm'
                : 'min-h-24 flex-col justify-center gap-2 rounded-xl px-2 text-sm',
            )}
          >
            <Icon aria-hidden="true" className={variant === 'chips' ? 'size-4' : 'size-6'} />
            {label}
            {selected && (
              <Check
                aria-hidden="true"
                className={cn(
                  'text-primary',
                  variant === 'chips' ? 'size-4' : 'absolute top-1.5 right-1.5 size-4',
                )}
              />
            )}
          </button>
        )
      })}
    </fieldset>
  )
}
