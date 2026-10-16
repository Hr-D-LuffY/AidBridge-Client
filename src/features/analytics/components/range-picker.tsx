'use client'

import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { parseRange, RANGE_PRESETS, type RangePreset } from '../analytics.params'

const DATE_INPUT =
  'h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30'

// The period the numbers cover: four ready-made ones, or a start and an end day. The URL (?range= or
// ?from=&to=) is the single source of truth, so a refresh or a shared link shows the same numbers.
export function RangePicker({ defaultPreset }: { defaultPreset: RangePreset }) {
  const query = useQueryParams()
  const fromId = useId()
  const toId = useId()
  const view = parseRange(
    { range: query.get('range'), from: query.get('from'), to: query.get('to') },
    defaultPreset,
  )

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:p-4 lg:flex-row lg:items-end lg:justify-between">
      <fieldset className="flex min-w-0 flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Period</legend>
        <div className="flex flex-wrap gap-2">
          {RANGE_PRESETS.map(({ value, label }) => {
            const selected = view.kind === 'preset' && view.preset === value
            return (
              <Button
                key={value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                aria-pressed={selected}
                className="h-11 px-4"
                // The default needs no ?range= in the URL; a ready-made period replaces a custom one.
                onClick={() =>
                  query.set({
                    range: value === defaultPreset ? undefined : value,
                    from: undefined,
                    to: undefined,
                  })
                }
              >
                {label}
              </Button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3 lg:w-96">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={fromId} className="text-sm font-medium">
            From
          </label>
          <input
            id={fromId}
            type="date"
            className={DATE_INPUT}
            value={view.kind === 'custom' ? (view.from ?? '') : ''}
            max={view.kind === 'custom' ? view.to : undefined}
            onChange={(event) =>
              query.set({
                range: undefined,
                from: event.target.value,
                to: view.kind === 'custom' ? view.to : undefined,
              })
            }
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={toId} className="text-sm font-medium">
            Until
          </label>
          <input
            id={toId}
            type="date"
            className={DATE_INPUT}
            value={view.kind === 'custom' ? (view.to ?? '') : ''}
            min={view.kind === 'custom' ? view.from : undefined}
            onChange={(event) =>
              query.set({
                range: undefined,
                from: view.kind === 'custom' ? view.from : undefined,
                to: event.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
