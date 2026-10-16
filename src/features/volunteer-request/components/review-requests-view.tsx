'use client'

import { Check, Mail, Phone, UserCheck, X } from 'lucide-react'
import { useId, useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ADMIN_PAGE_SIZE, REVIEW_NOTE_MAX_LENGTH } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { type AdminVolunteerRequest, VolunteerRequestStatus } from '@/types'
import {
  parseReviewParams,
  REVIEW_FILTER_OPTIONS,
  type ReviewFilter,
  toReviewQuery,
} from '../volunteer-request.params'
import { useReviewVolunteerRequest, useVolunteerRequestsQuery } from '../volunteer-request.queries'

type ReviewTarget = { request: AdminVolunteerRequest; action: 'approve' | 'reject' }

const EMPTY: Record<ReviewFilter, { title: string; description: string }> = {
  [VolunteerRequestStatus.PENDING]: {
    title: 'Nothing to review',
    description: 'New requests to become a volunteer show up here.',
  },
  [VolunteerRequestStatus.APPROVED]: {
    title: 'No approved requests yet',
    description: 'Requests you approve are listed here.',
  },
  [VolunteerRequestStatus.REJECTED]: {
    title: 'No rejected requests',
    description: 'Requests you did not approve are listed here.',
  },
  all: {
    title: 'No requests yet',
    description: 'When a user asks to become a volunteer, it shows up here.',
  },
}

function ReviewDialog({ target, onClose }: { target: ReviewTarget | null; onClose: () => void }) {
  const noteId = useId()
  const [note, setNote] = useState('')
  const approve = useReviewVolunteerRequest('approve')
  const reject = useReviewVolunteerRequest('reject')

  const action = target?.action ?? 'approve'
  const mutation = action === 'approve' ? approve : reject
  const name = target?.request.user.name ?? 'this person'

  function close() {
    setNote('')
    onClose()
  }

  function confirm() {
    if (!target) return
    mutation.mutate(
      { id: target.request.id, applicant: name, note: note.trim() || undefined },
      { onSettled: close },
    )
  }

  return (
    <ConfirmDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) close()
      }}
      tone={action === 'approve' ? 'neutral' : 'danger'}
      title={action === 'approve' ? `Approve ${name}?` : `Do not approve ${name}?`}
      description={
        action === 'approve'
          ? 'They become a volunteer at once and can accept requests. Their account stops being a victim account, so they can no longer raise an SOS. They are told, and your note goes with it.'
          : 'They stay as they are and can ask again later. They are told, and your note goes with it.'
      }
      confirmLabel={action === 'approve' ? 'Approve' : 'Do not approve'}
      cancelLabel="Go back"
      pending={mutation.isPending}
      onConfirm={confirm}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={noteId} className="text-sm font-medium">
          Note to {name} <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id={noteId}
          value={note}
          rows={3}
          maxLength={REVIEW_NOTE_MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-20 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>
    </ConfirmDialog>
  )
}

const contactLink =
  'inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11'

// People who asked to become volunteers. An admin reads why, sees how to reach them, and approves or does
// not. It opens on what needs a decision; the filter and page live in the URL. Whoever decides, the
// applicant is told by the backend.
export function ReviewRequestsView() {
  const params = useQueryParams()
  const view = parseReviewParams({ page: params.get('page'), status: params.get('status') })
  const query = useVolunteerRequestsQuery(toReviewQuery(view))
  const [target, setTarget] = useState<ReviewTarget | null>(null)
  const empty = EMPTY[view.filter]

  const columns: DataTableColumn<AdminVolunteerRequest>[] = [
    {
      id: 'applicant',
      header: 'Applicant',
      primary: true,
      cell: ({ user }) => (
        <div className="flex flex-col items-start">
          <span className="font-semibold">{user.name}</span>
          <a href={`mailto:${user.email}`} className={contactLink}>
            <Mail aria-hidden="true" className="size-3.5" />
            {user.email}
          </a>
          {user.phone ? (
            <a href={`tel:${user.phone}`} className={contactLink}>
              <Phone aria-hidden="true" className="size-3.5" />
              {user.phone}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No phone number</span>
          )}
        </div>
      ),
    },
    {
      id: 'message',
      header: 'Why',
      className: 'max-w-sm',
      cell: ({ message }) => <p className="text-pretty whitespace-pre-line">{message}</p>,
    },
    {
      id: 'sent',
      header: 'Sent',
      cell: ({ createdAt }) => (
        <span className="whitespace-nowrap">{formatDateTime(createdAt)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (request) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge kind="volunteerRequest" status={request.status} />
          {request.reviewNote && (
            <span className="text-sm text-muted-foreground">Note: {request.reviewNote}</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Decide',
      actions: true,
      align: 'right',
      cell: (request) =>
        request.status === VolunteerRequestStatus.PENDING ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              className="h-10 gap-1.5 px-3"
              onClick={() => setTarget({ request, action: 'approve' })}
            >
              <Check aria-hidden="true" />
              Approve
              <span className="sr-only"> {request.user.name}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-1.5 px-3"
              onClick={() => setTarget({ request, action: 'reject' })}
            >
              <X aria-hidden="true" />
              Reject
              <span className="sr-only"> {request.user.name}</span>
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {request.reviewedAt ? formatDateTime(request.reviewedAt) : 'Decided'}
          </span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Volunteer requests"
        description="People who asked to become volunteers. Read why, check how to reach them, then approve or not. Approving changes their account to a volunteer at once."
      />

      <FilterChips
        label="Show"
        hideAll
        options={REVIEW_FILTER_OPTIONS}
        value={view.filter}
        onChange={(filter) => params.set({ status: filter })}
      />

      <DataTable
        label="Volunteer requests"
        columns={columns}
        rows={query.data?.items}
        getRowId={(request) => request.id}
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
        empty={<EmptyState icon={UserCheck} title={empty.title} description={empty.description} />}
      />

      <ReviewDialog target={target} onClose={() => setTarget(null)} />
    </div>
  )
}
