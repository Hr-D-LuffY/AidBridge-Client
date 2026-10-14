'use client'

import { HandHeart, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppForm } from '@/hooks/use-app-form'
import { useSession } from '@/hooks/use-session'
import { getErrorMessage } from '@/lib/api/errors'
import { VOLUNTEER_REQUEST_MAX_LENGTH } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { type VolunteerRequest, VolunteerRequestStatus } from '@/types'
import {
  useCreateVolunteerRequest,
  useMyVolunteerRequestsQuery,
} from '../volunteer-request.queries'
import { type VolunteerRequestInput, volunteerRequestSchema } from '../volunteer-request.schema'

function RequestForm({ hasPhone }: { hasPhone: boolean }) {
  const create = useCreateVolunteerRequest()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { message: '' } as VolunteerRequestInput,
    validators: { onChange: volunteerRequestSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await create.mutateAsync(volunteerRequestSchema.parse(value).message)
        formApi.reset()
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, ['message'])) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <h2 className="text-lg">Ask to become a volunteer</h2>

      {!hasPhone && (
        <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm">
          <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Add a phone number first</p>
            <p>
              Volunteers are contacted by phone, so a request needs a number on your profile.{' '}
              <Link
                href="/dashboard/profile"
                className="font-medium text-link underline-offset-4 hover:underline"
              >
                Open your profile
              </Link>
            </p>
          </div>
        </div>
      )}

      <form.AppField name="message">
        {(field) => (
          <field.TextareaField
            label="Why do you want to volunteer?"
            rows={5}
            maxLength={VOLUNTEER_REQUEST_MAX_LENGTH}
            placeholder="Tell the administrator a little about yourself and how you can help."
            hint="An administrator reads this before approving."
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <form.AppForm>
        <form.SubmitButton disabled={!hasPhone}>Send request</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

function PendingCard({ request }: { request: VolunteerRequest }) {
  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg">Your request is waiting for review</h2>
        <StatusBadge kind="volunteerRequest" status={request.status} />
      </div>
      <p className="text-sm">
        Sent {formatRelativeTime(request.createdAt)}. You will get a notification when an
        administrator decides. You cannot send another while this one is open.
      </p>
      <p className="rounded-xl bg-card/70 p-3 text-sm text-pretty whitespace-pre-line">
        {request.message}
      </p>
    </section>
  )
}

function History({ requests }: { requests: VolunteerRequest[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg">Your earlier requests</h2>
      <ul className="flex flex-col gap-3">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge kind="volunteerRequest" status={request.status} />
              <span className="text-sm text-muted-foreground">
                {formatDateTime(request.createdAt)}
              </span>
            </div>
            <p className="text-sm text-pretty whitespace-pre-line">{request.message}</p>
            {request.reviewNote && (
              <p className="rounded-xl bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Administrator's note: </span>
                {request.reviewNote}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

// "Become a volunteer": what a victim does to get the volunteer role (an administrator approves it).
// One request can be open at a time; a rejected one can be followed by a new request.
export function VolunteerRequestView() {
  const session = useSession()
  const query = useMyVolunteerRequestsQuery()

  const requests = query.data?.items ?? []
  const pending = requests.find((request) => request.status === VolunteerRequestStatus.PENDING)
  const past = requests.filter((request) => request.status !== VolunteerRequestStatus.PENDING)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Become a volunteer"
        description="Volunteers accept rescue requests near them and hand out aid from relief camps. An administrator approves each volunteer."
      />

      {query.isPending ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : query.isError ? (
        <ListErrorState onRetry={() => query.refetch()} />
      ) : (
        <>
          {pending ? (
            <PendingCard request={pending} />
          ) : (
            <RequestForm hasPhone={Boolean(session.phone)} />
          )}
          {past.length > 0 && <History requests={past} />}
          {requests.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <HandHeart aria-hidden="true" className="size-4" />
              You have not asked before.
            </p>
          )}
        </>
      )}
    </div>
  )
}
