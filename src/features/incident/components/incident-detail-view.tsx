'use client'

import {
  CircleCheck,
  ExternalLink,
  Flag,
  Link2,
  Pencil,
  RotateCcw,
  Trash2,
  Unlink,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { StatCard } from '@/components/shared/stat-card'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSosListQuery } from '@/features/sos/sos.queries'
import { getErrorMessage } from '@/lib/api/errors'
import { formatDate } from '@/lib/format'
import { fromGeoPoint, getDirectionsUrl } from '@/lib/geo'
import { cn } from '@/lib/utils'
import { type Incident, IncidentStatus, SosLinkAction } from '@/types'
import {
  useDeleteIncident,
  useIncidentQuery,
  useLinkRequests,
  useSetIncidentPriority,
  useSetIncidentStatus,
} from '../incident.queries'
import { DISASTER_LABEL, PRIORITY_OPTIONS } from '../incident.view'
import { IncidentFormSheet } from './incident-form-sheet'
import { LinkRequestsSheet } from './link-requests-sheet'

// How many linked requests the panel shows at a time.
const LINKED_PAGE_SIZE = 10

function Panel({
  title,
  children,
  actions,
}: {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

// The requests linked to the incident (GET /sos?incidentId=), a page at a time, each with a way to open it
// and to take it off. Rendered only when some are linked.
function LinkedRequestList({ incidentId }: { incidentId: string }) {
  const [page, setPage] = useState(1)
  const requests = useSosListQuery({ incidentId, page, limit: LINKED_PAGE_SIZE })
  const unlink = useLinkRequests(incidentId)

  if (requests.isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2">
        <output className="sr-only">Loading the linked requests</output>
        {['one', 'two'].map((key) => (
          <Skeleton key={key} className="h-14 rounded-xl" />
        ))}
      </div>
    )
  }
  if (requests.isError) return <ListErrorState onRetry={() => requests.refetch()} />

  return (
    <>
      <ul className="divide-y">
        {requests.data.items.map((sos) => {
          const name = sos.address || `Request from ${sos.victim.name}`
          return (
            <li
              key={sos.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
            >
              <div className="flex min-w-0 flex-col items-start gap-1">
                <Link
                  href={`/admin/sos/${sos.id}`}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
                >
                  {name}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </Link>
                <StatusBadge kind="sos" status={sos.status} />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-10 gap-1.5 px-3 text-muted-foreground"
                disabled={unlink.isPending}
                onClick={() =>
                  unlink.mutate(
                    { action: SosLinkAction.UNLINK, ids: [sos.id] },
                    { onError: (error) => toast.error(getErrorMessage(error)) },
                  )
                }
              >
                <Unlink aria-hidden="true" />
                Unlink
                <span className="sr-only"> {name}</span>
              </Button>
            </li>
          )
        })}
      </ul>
      <PaginationBar
        meta={{ ...requests.data.meta, limit: LINKED_PAGE_SIZE }}
        onPageChange={setPage}
        disabled={requests.isFetching}
      />
    </>
  )
}

// One incident: its dates and place, the requests linked to it and how many were rescued, its priority, and
// the actions (edit, resolve or reopen, delete, link requests).
export function IncidentDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: incident } = useIncidentQuery(id)
  const setStatus = useSetIncidentStatus(id)
  const setPriority = useSetIncidentPriority(id)
  const remove = useDeleteIncident(id)

  const [editing, setEditing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!incident) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader back={{ href: '/admin/incidents', label: 'Incidents' }} title="Incident" />
        <EmptyState
          icon={Flag}
          title="Incident not found"
          description="It may have been deleted."
          action={
            <Link
              href="/admin/incidents"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
            >
              Back to incidents
            </Link>
          }
        />
      </div>
    )
  }

  const active = incident.status === IncidentStatus.ACTIVE
  const linkedIds = incident.sosRequests ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/admin/incidents', label: 'Incidents' }}
        title={incident.title}
        description={`${DISASTER_LABEL[incident.disasterType]}, started ${formatDate(incident.startDate)}`}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 px-4"
              onClick={() => setEditing(true)}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            {active ? (
              <Button type="button" className="h-11 gap-2 px-4" onClick={() => setResolving(true)}>
                <CircleCheck aria-hidden="true" />
                Resolve
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-2 px-4"
                disabled={setStatus.isPending}
                onClick={() => setStatus.mutate(IncidentStatus.ACTIVE)}
              >
                <RotateCcw aria-hidden="true" />
                Reopen
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 px-4 text-destructive hover:text-destructive"
              onClick={() => setDeleting(true)}
            >
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="incident" status={incident.status} />
        <PriorityBadge priority={incident.priority} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={Link2}
          label="Linked requests"
          value={incident.linkedRequests}
          hint="Requests this disaster caused"
        />
        <StatCard
          icon={CircleCheck}
          label="Rescued"
          value={incident.totalRescued}
          hint="Counted live from the linked requests"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <Panel
            title="Linked requests"
            actions={
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-1.5 px-3"
                onClick={() => setLinking(true)}
              >
                <Link2 aria-hidden="true" />
                Link requests
              </Button>
            }
          >
            {linkedIds.length > 0 ? (
              <LinkedRequestList incidentId={incident.id} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No requests are linked yet. Link the ones this disaster caused.
              </p>
            )}
          </Panel>

          <Panel title="About this incident">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Started">{formatDate(incident.startDate)}</Detail>
              <Detail label="Ended">
                {incident.endDate ? formatDate(incident.endDate) : 'Still active'}
              </Detail>
              <Detail label="Added by">{incident.createdBy.name}</Detail>
              <Detail label="Place">
                <IncidentPlace incident={incident} />
              </Detail>
            </dl>
            {incident.description ? (
              <p className="text-pretty whitespace-pre-line">{incident.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No details written.</p>
            )}
          </Panel>
        </div>

        <Panel title="Priority">
          <fieldset
            className="flex min-w-0 flex-wrap gap-2 border-0 p-0"
            disabled={setPriority.isPending}
          >
            <legend className="sr-only">Priority of this incident</legend>
            {PRIORITY_OPTIONS.map((option) => {
              const selected = option.value === incident.priority
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    if (!selected) setPriority.mutate(option.value)
                  }}
                  className={cn(
                    'min-h-11 cursor-pointer rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
                    selected
                      ? 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'border-input bg-card hover:bg-muted',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </fieldset>
        </Panel>
      </div>

      {editing && <IncidentFormSheet incident={incident} open onOpenChange={setEditing} />}
      {linking && (
        <LinkRequestsSheet
          incidentId={incident.id}
          linkedIds={linkedIds}
          open
          onOpenChange={setLinking}
        />
      )}

      <ConfirmDialog
        open={resolving}
        onOpenChange={(open) => {
          if (!setStatus.isPending) setResolving(open)
        }}
        tone="neutral"
        title="Resolve this incident?"
        description="Today is recorded as its end date. You can reopen it later, and its linked requests are not changed."
        confirmLabel="Resolve"
        cancelLabel="Keep it active"
        pending={setStatus.isPending}
        onConfirm={() =>
          setStatus.mutate(IncidentStatus.RESOLVED, { onSettled: () => setResolving(false) })
        }
      />

      <ConfirmDialog
        open={deleting}
        onOpenChange={(open) => {
          if (!remove.isPending) setDeleting(open)
        }}
        title="Delete this incident?"
        description="It disappears from the lists. The requests linked to it are not touched."
        confirmLabel="Delete incident"
        cancelLabel="Keep incident"
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => router.push('/admin/incidents'),
            onSettled: () => setDeleting(false),
          })
        }
      />
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function IncidentPlace({ incident }: { incident: Incident }) {
  const { lat, lng } = fromGeoPoint(incident.location)
  return (
    <span className="flex flex-col items-start">
      {incident.address && <span>{incident.address}</span>}
      <a
        href={getDirectionsUrl(incident.location)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
      >
        <ExternalLink aria-hidden="true" className="size-3.5" />
        {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
        <span className="sr-only"> (opens a map in a new tab)</span>
      </a>
    </span>
  )
}
