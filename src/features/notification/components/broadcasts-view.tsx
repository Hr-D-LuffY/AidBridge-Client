'use client'

import { Megaphone, Send } from 'lucide-react'
import { useState } from 'react'
import { useFieldContext } from '@/components/forms/form-context'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { getFieldError } from '@/components/forms/use-field-error'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppForm } from '@/hooks/use-app-form'
import { useQueryParams } from '@/hooks/use-query-params'
import { getErrorMessage } from '@/lib/api/errors'
import {
  ADMIN_PAGE_SIZE,
  BROADCAST_MESSAGE_MAX_LENGTH,
  BROADCAST_TITLE_MAX_LENGTH,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ALL_ROLES_TARGET, type NotificationTarget } from '@/types'
import {
  BROADCAST_TARGETS,
  type BroadcastInput,
  broadcastSchema,
  describeTargets,
  toBroadcastHistoryQuery,
} from '../notification.broadcast'
import { useNotificationsQuery, useSendBroadcast } from '../notification.queries'

const FIELD_NAMES = ['title', 'message', 'targetRoles', 'isEmergencyBroadcast'] as const

// Who gets it, as checkboxes. "Everyone" stands alone, as the backend wants: choosing it clears the roles,
// and choosing a role clears it.
function TargetsField() {
  const field = useFieldContext<string[]>()
  const error = getFieldError(field)
  const value = field.state.value

  function toggle(target: NotificationTarget) {
    if (target === ALL_ROLES_TARGET) {
      field.handleChange(value.includes(target) ? [] : [ALL_ROLES_TARGET])
    } else {
      const roles = value.filter((item) => item !== ALL_ROLES_TARGET)
      field.handleChange(
        roles.includes(target) ? roles.filter((item) => item !== target) : [...roles, target],
      )
    }
    field.handleBlur()
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-medium">Send to</legend>
      <div className="flex flex-wrap gap-2">
        {BROADCAST_TARGETS.map((target) => {
          const selected = value.includes(target.value)
          return (
            <label
              key={target.value}
              className={cn(
                'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                selected
                  ? 'border-primary bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'border-input bg-card hover:bg-muted',
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(target.value)}
                className="size-4 cursor-pointer accent-primary"
              />
              {target.label}
            </label>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}

function Composer() {
  const send = useSendBroadcast()
  const [serverError, setServerError] = useState<string | null>(null)
  // An emergency broadcast sends real emails, so it waits here for a second yes.
  const [confirming, setConfirming] = useState<BroadcastInput | null>(null)

  const form = useAppForm({
    defaultValues: {
      title: '',
      message: '',
      targetRoles: [],
      isEmergencyBroadcast: false,
    } as BroadcastInput,
    validators: { onChange: broadcastSchema },
    onSubmit: async ({ value }) => {
      if (value.isEmergencyBroadcast) setConfirming(value)
      else await deliver(value)
    },
  })

  async function deliver(value: BroadcastInput) {
    setServerError(null)
    const fields = broadcastSchema.parse(value)
    try {
      await send.mutateAsync({
        title: fields.title,
        message: fields.message,
        targetRoles: fields.targetRoles as NotificationTarget[],
        isEmergencyBroadcast: fields.isEmergencyBroadcast,
      })
      form.reset()
    } catch (error) {
      if (!mapServerFieldErrors(form, error, FIELD_NAMES)) setServerError(getErrorMessage(error))
    }
  }

  return (
    <>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6"
      >
        <form.AppField name="title">
          {(field) => (
            <field.TextField
              label="Title"
              placeholder="For example Flood warning for Dhaka"
              maxLength={BROADCAST_TITLE_MAX_LENGTH}
            />
          )}
        </form.AppField>

        <form.AppField name="message">
          {(field) => (
            <field.TextareaField
              label="Message"
              rows={5}
              maxLength={BROADCAST_MESSAGE_MAX_LENGTH}
              placeholder="What people need to know, and what to do."
            />
          )}
        </form.AppField>

        <form.AppField name="targetRoles">{() => <TargetsField />}</form.AppField>

        <form.AppField name="isEmergencyBroadcast">
          {(field) => (
            <field.CheckboxField
              label="Emergency broadcast: also send an email"
              hint="Emails every active account in the chosen roles. Use it only for something people must see now."
            />
          )}
        </form.AppField>

        <FormError message={serverError} />

        <form.AppForm>
          <form.SubmitButton>
            <Send aria-hidden="true" />
            Send
          </form.SubmitButton>
        </form.AppForm>
      </form>

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open && !send.isPending) setConfirming(null)
        }}
        title="Send this emergency broadcast?"
        description={
          <>
            An email goes to every active account among{' '}
            <strong>{describeTargets(confirming?.targetRoles ?? [])}</strong>, besides the
            notification in the app. It cannot be taken back once it is sent.
          </>
        }
        confirmLabel="Send emergency broadcast"
        cancelLabel="Go back"
        pending={send.isPending}
        onConfirm={async () => {
          if (!confirming) return
          await deliver(confirming)
          setConfirming(null)
        }}
      />
    </>
  )
}

function History() {
  const params = useQueryParams()
  const query = useNotificationsQuery(toBroadcastHistoryQuery(params.get('page')), false)

  if (query.isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <output className="sr-only">Loading</output>
        {['one', 'two', 'three'].map((id) => (
          <Skeleton key={id} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }
  if (query.isError) return <ListErrorState onRetry={() => query.refetch()} />
  if (query.data.items.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Nothing sent to everyone yet"
        description="Broadcasts addressed to everyone or to admins show up here."
      />
    )
  }

  return (
    <>
      <ul aria-label="Recent broadcasts" className="flex flex-col gap-3">
        {query.data.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1.5 rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              {item.isEmergencyBroadcast && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
                  <Megaphone aria-hidden="true" className="size-3.5" />
                  Emergency alert
                </span>
              )}
              <time dateTime={item.createdAt} className="text-sm text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </time>
            </div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-pretty whitespace-pre-line">{item.message}</p>
          </li>
        ))}
      </ul>
      <PaginationBar
        meta={{ ...query.data.meta, limit: ADMIN_PAGE_SIZE }}
        onPageChange={params.setPage}
        disabled={query.isFetching}
      />
    </>
  )
}

// Writes to people on the platform: a notification in their bell, and for an emergency also an email. The
// backend keeps no list of what an admin sent to other roles, so the history below shows what is addressed
// to everyone or to admins, which is what the server lets an admin read.
export function BroadcastsView() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Broadcasts"
        description="Tell people something. Everyone you choose gets a notification; an emergency broadcast also sends them an email."
      />

      <section aria-labelledby="compose-heading" className="flex max-w-3xl flex-col gap-3">
        <h2 id="compose-heading" className="text-lg">
          New broadcast
        </h2>
        <Composer />
      </section>

      <section aria-labelledby="history-heading" className="flex max-w-3xl flex-col gap-3">
        <h2 id="history-heading" className="text-lg">
          Recent broadcasts
        </h2>
        <p className="text-sm text-muted-foreground">
          What was addressed to everyone or to admins. A message sent only to other roles is not
          listed: the server does not keep a separate history of what an admin sent.
        </p>
        <History />
      </section>
    </div>
  )
}
