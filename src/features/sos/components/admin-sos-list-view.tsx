'use client'

import { ArrowRight, Phone, SearchX, Siren } from 'lucide-react'
import Link from 'next/link'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { PageHeader } from '@/components/shared/page-header'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ADMIN_PAGE_SIZE } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/format'
import { Priority, type SosRequest, SosStatus } from '@/types'
import { parseAdminSosParams, toAdminSosQuery } from '../sos.admin'
import { useSosListQuery } from '../sos.queries'
import { STATUS_SWATCH } from '../sos.surface'

const STATUS_OPTIONS = [
  { value: SosStatus.PENDING, label: 'Waiting', swatch: STATUS_SWATCH[SosStatus.PENDING] },
  { value: SosStatus.ASSIGNED, label: 'Assigned', swatch: STATUS_SWATCH[SosStatus.ASSIGNED] },
  { value: SosStatus.ON_THE_WAY, label: 'On the way', swatch: STATUS_SWATCH[SosStatus.ON_THE_WAY] },
  { value: SosStatus.RESCUED, label: 'Rescued', swatch: STATUS_SWATCH[SosStatus.RESCUED] },
  { value: SosStatus.CLOSED, label: 'Closed', swatch: STATUS_SWATCH[SosStatus.CLOSED] },
] as const

const PRIORITY_OPTIONS = [
  { value: Priority.CRITICAL, label: 'Critical' },
  { value: Priority.HIGH, label: 'High' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.LOW, label: 'Low' },
] as const

const COLUMNS: DataTableColumn<SosRequest>[] = [
  {
    id: 'request',
    header: 'Request',
    primary: true,
    cell: (sos) => (
      <div className="flex flex-col items-start gap-1.5">
        <Link
          href={`/admin/sos/${sos.id}`}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
        >
          {sos.address || `Request from ${sos.victim.name}`}
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only"> (open request)</span>
        </Link>
        <ReliefBadges categories={sos.needs} />
      </div>
    ),
  },
  { id: 'status', header: 'Status', cell: (sos) => <StatusBadge kind="sos" status={sos.status} /> },
  { id: 'priority', header: 'Priority', cell: (sos) => <PriorityBadge priority={sos.priority} /> },
  {
    id: 'victim',
    header: 'Victim',
    cell: ({ victim }) => (
      <div className="flex flex-col items-start">
        <span>{victim.name}</span>
        <a
          href={`tel:${victim.phone}`}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
        >
          <Phone aria-hidden="true" className="size-3.5" />
          {victim.phone}
        </a>
      </div>
    ),
  },
  {
    id: 'volunteer',
    header: 'Volunteer',
    cell: ({ assignedVolunteer }) =>
      assignedVolunteer ? (
        assignedVolunteer.name
      ) : (
        <span className="text-muted-foreground">Nobody yet</span>
      ),
  },
  {
    id: 'raised',
    header: 'Raised',
    cell: ({ createdAt }) => (
      <span className="whitespace-nowrap">{formatRelativeTime(createdAt)}</span>
    ),
  },
]

// Every SOS request on the platform, newest first, paged by the server. Status and priority filter it,
// and both (with the page) live in the URL. An admin opens a request to read it, follow its chat and
// change its priority.
export function AdminSosListView() {
  const params = useQueryParams()
  const view = parseAdminSosParams({
    page: params.get('page'),
    status: params.get('status'),
    priority: params.get('priority'),
  })
  const query = useSosListQuery(toAdminSosQuery(view))

  const filtered = Boolean(view.status || view.priority)
  const clearFilters = () => params.clear('status', 'priority')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="SOS requests"
        description="Every request for help on the platform. Open one to read it, follow the conversation and change how urgent it is."
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
      </div>

      <DataTable
        label="SOS requests"
        columns={COLUMNS}
        rows={query.data?.items}
        getRowId={(sos) => sos.id}
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
              title="No requests match"
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
              icon={Siren}
              title="No requests yet"
              description="When someone raises an SOS, it shows up here."
            />
          )
        }
      />
    </div>
  )
}
