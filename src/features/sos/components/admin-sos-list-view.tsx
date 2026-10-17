'use client'

import { ArrowRight, Phone, SearchX, Siren } from 'lucide-react'
import Link from 'next/link'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { ReliefBadges } from '@/components/shared/relief-category'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ADMIN_PAGE_SIZE } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/format'
import type { SosRequest } from '@/types'
import { countActiveFilters, parseSosParams, toSosQuery } from '../sos.params'
import { useSosListQuery } from '../sos.queries'
import { SosToolbar } from './sos-toolbar'

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

// Every SOS request on the platform, paged by the server. Search, sort, status, priority, needs and the
// dates it was raised filter it, and all of them (with the page) live in the URL. An admin opens a request to read it, follow its chat and
// change its priority.
export function AdminSosListView() {
  const params = useQueryParams()
  const view = parseSosParams({
    page: params.get('page'),
    status: params.get('status'),
    priority: params.get('priority'),
    needs: params.get('needs'),
    q: params.get('q'),
    from: params.get('from'),
    to: params.get('to'),
    sort: params.get('sort'),
  })
  const query = useSosListQuery(toSosQuery(view, ADMIN_PAGE_SIZE))

  const filtered = countActiveFilters(view) > 0
  const clearFilters = () => params.clear('status', 'priority', 'needs', 'q', 'from', 'to')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="SOS requests"
        description="Every request for help on the platform. Open one to read it, follow the conversation and change how urgent it is."
      />

      <SosToolbar view={view} params={params} />

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
