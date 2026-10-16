'use client'

import { ArrowRight, Flag, Plus, SearchX } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { PageHeader } from '@/components/shared/page-header'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ADMIN_PAGE_SIZE } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { type Incident, IncidentStatus } from '@/types'
import { parseIncidentParams, toIncidentQuery } from '../incident.params'
import { useIncidentsQuery } from '../incident.queries'
import { DISASTER_LABEL, DISASTER_OPTIONS, PRIORITY_OPTIONS } from '../incident.view'
import { IncidentFormSheet } from './incident-form-sheet'

const STATUS_OPTIONS = [
  { value: IncidentStatus.ACTIVE, label: 'Active' },
  { value: IncidentStatus.RESOLVED, label: 'Resolved' },
] as const

const COLUMNS: DataTableColumn<Incident>[] = [
  {
    id: 'incident',
    header: 'Incident',
    primary: true,
    cell: (incident) => (
      <div className="flex flex-col items-start">
        <Link
          href={`/admin/incidents/${incident.id}`}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
        >
          {incident.title}
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only"> (open incident)</span>
        </Link>
        <span className="text-sm text-muted-foreground">
          {DISASTER_LABEL[incident.disasterType]}
          {incident.address && ` · ${incident.address}`}
        </span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (incident) => <StatusBadge kind="incident" status={incident.status} />,
  },
  {
    id: 'priority',
    header: 'Priority',
    cell: (incident) => <PriorityBadge priority={incident.priority} />,
  },
  {
    id: 'requests',
    header: 'Requests',
    cell: (incident) => (
      <span className="tabular-nums">
        {incident.linkedRequests} linked, {incident.totalRescued} rescued
      </span>
    ),
  },
  {
    id: 'started',
    header: 'Started',
    cell: (incident) => <span className="whitespace-nowrap">{formatDate(incident.startDate)}</span>,
  },
]

// The disasters the admins track. Status, priority and kind filter the list, and they (with the page)
// live in the URL. An incident is added in a sheet; opening one shows its requests and lets an admin
// resolve it.
export function IncidentsView() {
  const params = useQueryParams()
  const view = parseIncidentParams({
    page: params.get('page'),
    status: params.get('status'),
    priority: params.get('priority'),
    type: params.get('type'),
  })
  const query = useIncidentsQuery(toIncidentQuery(view))
  const [adding, setAdding] = useState(false)

  const filtered = Boolean(view.status || view.priority || view.disasterType)
  const clearFilters = () => params.clear('status', 'priority', 'type')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Incidents"
        description="The disasters you are responding to. Link the requests each one caused to see how many people were rescued."
        actions={
          <Button type="button" className="h-11 gap-2 px-5" onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            Add incident
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <FilterChips
          label="Status"
          options={STATUS_OPTIONS}
          value={view.status}
          onChange={(status) => params.set({ status })}
        />
        <FilterChips
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={view.priority}
          onChange={(priority) => params.set({ priority })}
        />
        <FilterChips
          label="Kind"
          options={DISASTER_OPTIONS}
          value={view.disasterType}
          onChange={(type) => params.set({ type })}
        />
      </div>

      <DataTable
        label="Incidents"
        columns={COLUMNS}
        rows={query.data?.items}
        getRowId={(incident) => incident.id}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        isError={query.isError}
        onRetry={() => query.refetch()}
        skeletonRows={ADMIN_PAGE_SIZE}
        pagination={
          query.data && {
            meta: { ...query.data.meta, limit: ADMIN_PAGE_SIZE },
            onPageChange: params.setPage,
          }
        }
        empty={
          filtered ? (
            <EmptyState
              icon={SearchX}
              title="No incidents match"
              description="Nothing fits these filters. Clear them to see everything."
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
              icon={Flag}
              title="No incidents yet"
              description="Add a disaster to group the requests it caused and follow how many were rescued."
              action={
                <Button type="button" className="h-10 gap-2 px-4" onClick={() => setAdding(true)}>
                  <Plus aria-hidden="true" />
                  Add the first incident
                </Button>
              }
            />
          )
        }
      />

      {adding && <IncidentFormSheet incident={null} open onOpenChange={setAdding} />}
    </div>
  )
}
