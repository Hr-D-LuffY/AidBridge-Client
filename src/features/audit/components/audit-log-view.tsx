'use client'

import { ArrowRight, ScrollText, SearchX } from 'lucide-react'
import Link from 'next/link'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { DateFilter } from '@/components/shared/date-filter'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SelectFilter } from '@/components/shared/select-filter'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { useUsersQuery } from '@/features/user/user.queries'
import { useQueryParams } from '@/hooks/use-query-params'
import { ADMIN_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { type AuditEntry, Role } from '@/types'
import { parseAuditParams, toAuditQuery } from '../audit.params'
import { useAuditLogQuery } from '../audit.queries'
import {
  AUDIT_ACTION_LABEL,
  AUDIT_TARGET_LABEL,
  getAuditActionLabel,
  getAuditNote,
  getAuditTargetHref,
  getAuditTargetLabel,
} from '../audit.view'

const ACTION_OPTIONS = Object.entries(AUDIT_ACTION_LABEL).map(([value, label]) => ({
  value,
  label,
}))
const TARGET_OPTIONS = Object.entries(AUDIT_TARGET_LABEL).map(([value, label]) => ({
  value,
  label,
}))

// An entry the system wrote has no actor; one whose account is gone keeps only its id.
function ActorCell({ entry }: { entry: AuditEntry }) {
  if (!entry.actor) return <span className="font-semibold">System</span>
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-semibold">
        {entry.actor.name ?? <span className="text-muted-foreground">Deleted account</span>}
      </span>
      {entry.actorRole && <StatusBadge kind="role" status={entry.actorRole} />}
    </div>
  )
}

function TargetCell({ entry }: { entry: AuditEntry }) {
  const href = getAuditTargetHref(entry)
  const label = getAuditTargetLabel(entry.targetType)
  if (!href) return <span>{label}</span>
  return (
    <Link
      href={href}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-4" />
      <span className="sr-only"> (open it)</span>
    </Link>
  )
}

const COLUMNS: DataTableColumn<AuditEntry>[] = [
  {
    id: 'when',
    header: 'When',
    cell: (entry) => <span className="whitespace-nowrap">{formatDateTime(entry.createdAt)}</span>,
  },
  { id: 'who', header: 'Who', cell: (entry) => <ActorCell entry={entry} /> },
  {
    id: 'action',
    header: 'Action',
    primary: true,
    cell: (entry) => <span className="font-semibold">{getAuditActionLabel(entry.action)}</span>,
  },
  { id: 'target', header: 'On', cell: (entry) => <TargetCell entry={entry} /> },
  {
    id: 'summary',
    header: 'Summary',
    className: 'min-w-64 whitespace-normal',
    cell: (entry) => {
      const note = getAuditNote(entry.meta)
      return (
        <div className="flex flex-col gap-1">
          <span className="wrap-anywhere">{entry.summary}</span>
          {note && <span className="wrap-anywhere text-sm text-muted-foreground">“{note}”</span>}
        </div>
      )
    },
  },
]

// Who did what to whose data, newest first: read only. Every filter and the page live in the URL. The
// actor is picked from the admin accounts, because the backend filters by user id, not by name.
export function AuditLogView() {
  const params = useQueryParams()
  const view = parseAuditParams({
    page: params.get('page'),
    actor: params.get('actor'),
    action: params.get('action'),
    type: params.get('type'),
    from: params.get('from'),
    to: params.get('to'),
  })
  const query = useAuditLogQuery(toAuditQuery(view))
  const admins = useUsersQuery({ role: Role.ADMIN, limit: MAX_PAGE_SIZE })

  const filtered = Boolean(view.actor || view.action || view.type || view.from || view.to)
  const clearFilters = () => params.clear('actor', 'action', 'type', 'from', 'to')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Who did what to whose data. Entries cannot be edited or deleted, and are removed after a year."
      />

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <SelectFilter
            label="Who"
            allLabel="Everyone"
            value={view.actor}
            options={(admins.data?.items ?? []).map((admin) => ({
              value: admin.id,
              label: admin.name,
            }))}
            onChange={(actor) => params.set({ actor })}
          />
          <SelectFilter
            label="Action"
            allLabel="All actions"
            value={view.action}
            options={ACTION_OPTIONS}
            onChange={(action) => params.set({ action })}
          />
          <SelectFilter
            label="On"
            allLabel="Anything"
            value={view.type}
            options={TARGET_OPTIONS}
            onChange={(type) => params.set({ type })}
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
        label="Audit log"
        columns={COLUMNS}
        rows={query.data?.items}
        getRowId={(entry) => entry.id}
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
              title="No entries match"
              description="Nothing was recorded with these filters. Clear them to see everything."
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
              icon={ScrollText}
              title="Nothing recorded yet"
              description="When an admin blocks an account, reviews a volunteer request, changes a priority or sends a broadcast, it shows up here."
            />
          )
        }
      />
    </div>
  )
}
