'use client'

import { FilterX, ListFilter, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { DateFilter } from '@/components/shared/date-filter'
import { MultiFilterChips } from '@/components/shared/multi-filter-chips'
import { RELIEF_CATEGORY_OPTIONS } from '@/components/shared/relief-category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { useQueryParams } from '@/hooks/use-query-params'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Priority, SosSort, SosStatus } from '@/types'
import {
  countActiveFilters,
  SOS_SEARCH_MAX_LENGTH,
  SOS_SEARCH_MIN_LENGTH,
  SOS_SORT_LABEL,
  type SosView,
} from '../sos.params'
import { STATUS_SWATCH } from '../sos.surface'

// Each status shows the colour its cards have in the list, so the colours explain themselves.
const STATUS_OPTIONS: readonly { value: SosStatus; label: string; swatch: string }[] = [
  { value: SosStatus.PENDING, label: 'Waiting', swatch: STATUS_SWATCH[SosStatus.PENDING] },
  { value: SosStatus.ASSIGNED, label: 'Assigned', swatch: STATUS_SWATCH[SosStatus.ASSIGNED] },
  { value: SosStatus.ON_THE_WAY, label: 'On the way', swatch: STATUS_SWATCH[SosStatus.ON_THE_WAY] },
  { value: SosStatus.RESCUED, label: 'Rescued', swatch: STATUS_SWATCH[SosStatus.RESCUED] },
  { value: SosStatus.CLOSED, label: 'Closed', swatch: STATUS_SWATCH[SosStatus.CLOSED] },
]

const PRIORITY_OPTIONS = [
  { value: Priority.CRITICAL, label: 'Critical' },
  { value: Priority.HIGH, label: 'High' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.LOW, label: 'Low' },
] as const

const SORT_OPTIONS = Object.values(SosSort)

type SosToolbarProps = {
  view: SosView
  params: ReturnType<typeof useQueryParams>
}

const join = (values: readonly string[]) => (values.length ? values.join(',') : undefined)

// Search, sort and filters for a list of SOS requests ("My requests", and the admin list). The server does
// the filtering; everything is written to the URL (?q=&sort=&status=&priority=&needs=&from=&to=, a list
// as a comma-separated value), so a refresh, the back button or a shared link shows the same list.
// Typing in the search box updates the URL only after a pause, and changing any filter returns to page 1.
export function SosToolbar({ view, params }: SosToolbarProps) {
  const searchId = useId()
  const hintId = useId()
  const sortId = useId()
  const [search, setSearch] = useState(view.q)
  // On a phone the chips are folded away behind a "Filters" button; from md up they are always shown.
  const [filtersOpen, setFiltersOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function onSearchChange(value: string) {
    setSearch(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => params.set({ q: value.trim() }), SEARCH_DEBOUNCE_MS)
  }

  function clearSearch() {
    clearTimeout(timer.current)
    setSearch('')
    params.set({ q: undefined })
  }

  function clearAll() {
    clearTimeout(timer.current)
    setSearch('')
    params.clear('status', 'priority', 'needs', 'q', 'from', 'to')
  }

  const active = countActiveFilters(view)

  // What is switched on, as removable chips: one tap takes a single filter off.
  const chips: { key: string; label: string; onRemove: () => void }[] = []
  const labelsOf = (options: readonly { value: string; label: string }[], values: string[]) =>
    options
      .filter((option) => values.includes(option.value))
      .map((option) => option.label)
      .join(', ')
  if (view.status.length) {
    chips.push({
      key: 'status',
      label: labelsOf(STATUS_OPTIONS, view.status),
      onRemove: () => params.set({ status: undefined }),
    })
  }
  if (view.priority.length) {
    chips.push({
      key: 'priority',
      label: `${labelsOf(PRIORITY_OPTIONS, view.priority)} priority`,
      onRemove: () => params.set({ priority: undefined }),
    })
  }
  if (view.needs.length) {
    chips.push({
      key: 'needs',
      label: `Needs ${labelsOf(RELIEF_CATEGORY_OPTIONS, view.needs).toLowerCase()}`,
      onRemove: () => params.set({ needs: undefined }),
    })
  }
  if (view.from) {
    chips.push({
      key: 'from',
      label: `From ${view.from}`,
      onRemove: () => params.set({ from: undefined }),
    })
  }
  if (view.to) {
    chips.push({
      key: 'to',
      label: `Until ${view.to}`,
      onRemove: () => params.set({ to: undefined }),
    })
  }
  if (view.q) chips.push({ key: 'q', label: `"${view.q}"`, onRemove: clearSearch })

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor={searchId} className="text-sm font-medium">
            Search
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={searchId}
              type="search"
              value={search}
              maxLength={SOS_SEARCH_MAX_LENGTH}
              placeholder="Words in the address or details"
              aria-describedby={hintId}
              className="h-11 pr-10 pl-9 text-base md:text-sm"
              onChange={(event) => onSearchChange(event.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <p id={hintId} className="text-xs text-muted-foreground">
            Whole words, at least {SOS_SEARCH_MIN_LENGTH} letters. “flood” finds “Flood on the
            road”, not “flooded”.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 sm:w-56">
          <label htmlFor={sortId} className="text-sm font-medium">
            Sort by
          </label>
          <select
            id={sortId}
            value={view.sort}
            onChange={(event) => params.set({ sort: event.target.value })}
            className="h-11 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 dark:[&>option]:bg-card"
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort} value={sort}>
                {SOS_SORT_LABEL[sort]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 sm:pt-[1.625rem]">
          <Button
            type="button"
            variant="outline"
            aria-expanded={filtersOpen}
            className="h-11 gap-2 px-4 md:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <ListFilter aria-hidden="true" />
            Filters{active > 0 && ` (${active})`}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 px-4"
            disabled={active === 0}
            onClick={clearAll}
          >
            <FilterX aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      </div>

      <div className={cn('flex-col gap-3', filtersOpen ? 'flex' : 'hidden md:flex')}>
        <MultiFilterChips
          label="Status"
          options={STATUS_OPTIONS}
          value={view.status}
          onChange={(status) => params.set({ status: join(status) })}
        />
        <MultiFilterChips
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={view.priority}
          onChange={(priority) => params.set({ priority: join(priority) })}
        />
        <MultiFilterChips
          label="Needs"
          options={RELIEF_CATEGORY_OPTIONS}
          value={view.needs}
          onChange={(needs) => params.set({ needs: join(needs) })}
        />
        <div className="grid max-w-md gap-3 sm:grid-cols-2">
          <DateFilter
            label="Raised from"
            value={view.from}
            max={view.to}
            onChange={(from) => params.set({ from })}
          />
          <DateFilter
            label="Until (including this day)"
            value={view.to}
            min={view.from}
            onChange={(to) => params.set({ to })}
          />
        </div>
      </div>

      {chips.length > 0 && (
        <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2 border-t pt-3">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={chip.onRemove}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-primary/40 bg-sidebar-accent py-1 pr-2 pl-3 text-sm font-medium text-sidebar-accent-foreground outline-none transition-colors hover:bg-sidebar-accent/70 focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
              >
                {chip.label}
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Remove filter</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
