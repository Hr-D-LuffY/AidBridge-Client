'use client'

import { Phone, SearchX, Truck } from 'lucide-react'
import { useId } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { getReliefLabel } from '@/components/shared/relief-category'
import { SelectFilter } from '@/components/shared/select-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCampOptionsQuery } from '@/features/camp/camp.queries'
import { useVolunteersQuery } from '@/features/user/user.queries'
import { useQueryParams } from '@/hooks/use-query-params'
import { NGO_PAGE_SIZE } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import type { Distribution } from '@/types'
import { parseDistributionParams, toDistributionQuery } from '../distribution.params'
import { useDistributionsQuery } from '../distribution.queries'

function DateFilter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: string | undefined
  min?: string
  max?: string
  onChange: (value: string | undefined) => void
}) {
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

const COLUMNS: DataTableColumn<Distribution>[] = [
  {
    id: 'item',
    header: 'Aid',
    primary: true,
    cell: ({ item }) => (
      <div className="flex flex-col">
        <span className="font-semibold">
          <span className="tabular-nums">{item.quantity}</span> {item.unit} of {item.itemName}
        </span>
        <span className="text-sm font-normal text-muted-foreground">
          {getReliefLabel(item.category)}
        </span>
      </div>
    ),
  },
  { id: 'recipient', header: 'Given to', cell: ({ recipient }) => recipient.name },
  { id: 'camp', header: 'From camp', cell: ({ camp }) => camp.name },
  {
    id: 'volunteer',
    header: 'Handed out by',
    cell: ({ volunteer }) => (
      <div className="flex flex-col items-start md:items-start">
        <span>{volunteer.name}</span>
        {volunteer.phone && (
          <a
            href={`tel:${volunteer.phone}`}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            {volunteer.phone}
          </a>
        )}
      </div>
    ),
  },
  {
    id: 'date',
    header: 'When',
    cell: ({ distributedAt }) => (
      <span className="whitespace-nowrap">{formatDateTime(distributedAt)}</span>
    ),
  },
  {
    id: 'notes',
    header: 'Note',
    cell: ({ notes }) => notes ?? <span className="text-muted-foreground">None</span>,
  },
]

// The hand-out history, newest first: what was given, to whom, from which camp and by which volunteer.
// An NGO sees only hand-outs from its own camps. Camp, volunteer and dates filter it, and everything
// (filters and page) lives in the URL. Victims' phone numbers are never part of it. An admin sees the
// hand-outs of every camp instead of only their own.
export function DistributionHistoryView({ admin = false }: { admin?: boolean }) {
  const params = useQueryParams()
  const view = parseDistributionParams({
    page: params.get('page'),
    camp: params.get('camp'),
    volunteer: params.get('volunteer'),
    from: params.get('from'),
    to: params.get('to'),
  })
  const query = useDistributionsQuery(toDistributionQuery(view))
  const camps = useCampOptionsQuery()
  const volunteers = useVolunteersQuery()

  const filtered = Boolean(view.camp || view.volunteer || view.from || view.to)
  const clearFilters = () => params.clear('camp', 'volunteer', 'from', 'to')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Distribution"
        description={
          admin
            ? 'Every hand-out from every camp: what was given, to whom, and by which volunteer.'
            : 'Every hand-out from your camps: what was given, to whom, and by which volunteer. Stock comes off at the moment of the hand-out.'
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SelectFilter
            label="Camp"
            allLabel="All camps"
            value={view.camp}
            options={(camps.data?.items ?? []).map((camp) => ({
              value: camp.id,
              label: camp.name,
            }))}
            onChange={(camp) => params.set({ camp })}
          />
          <SelectFilter
            label="Volunteer"
            allLabel="All volunteers"
            value={view.volunteer}
            options={(volunteers.data?.items ?? []).map((volunteer) => ({
              value: volunteer.id,
              label: volunteer.name,
            }))}
            onChange={(volunteer) => params.set({ volunteer })}
          />
          <DateFilter
            label="From"
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
        {filtered && (
          <div>
            <Button type="button" variant="outline" className="h-10 px-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <DataTable
        label="Hand-outs"
        columns={COLUMNS}
        rows={query.data?.items}
        getRowId={(record) => record.id}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        isError={query.isError}
        onRetry={() => query.refetch()}
        skeletonRows={NGO_PAGE_SIZE}
        pagination={
          query.data && {
            meta: { ...query.data.meta, limit: NGO_PAGE_SIZE },
            onPageChange: params.setPage,
          }
        }
        empty={
          filtered ? (
            <EmptyState
              icon={SearchX}
              title="No hand-outs match"
              description="Nothing was handed out with these filters. Clear them to see everything."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-4"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Truck}
              title="Nothing handed out yet"
              description={`When a volunteer hands out stock from ${admin ? 'a camp' : 'one of your camps'}, the record shows up here.`}
            />
          )
        }
      />
    </div>
  )
}
