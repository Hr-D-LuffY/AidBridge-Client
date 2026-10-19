'use client'

import { MessageSquare, Pencil, Phone, Siren, UserRound, XCircle } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { ReliefBadges } from '@/components/shared/relief-category'
import { RequestedSkills } from '@/components/shared/skill-chips'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { ChatPanel } from '@/features/message/components/chat-panel'
import { RateVolunteer } from '@/features/task/components/rate-volunteer'
import { usePolling } from '@/hooks/use-polling'
import { POLL_INTERVAL_MS, SOS_RESOLVE_REASON_MAX_LENGTH } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { ResolvedBy, type SosRequest, TaskStatus } from '@/types'
import { isSosFinished, useResolveSos, useSosQuery } from '../sos.queries'
import { resolveReasonSchema } from '../sos.schema'
import { EditSosSheet } from './edit-sos-sheet'
import { SosLocationPanel } from './sos-location-panel'
import { SosMedia } from './sos-media'
import { SosProgress } from './sos-progress'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function ResolvePanel({ sos }: { sos: SosRequest }) {
  const label = sos.resolvedBy === ResolvedBy.ADMIN ? 'an administrator' : 'you'
  return (
    <Panel title="How it ended">
      <p className="text-sm">
        Closed by {label}
        {sos.resolvedAt && <> on {formatDateTime(sos.resolvedAt)}</>}.
      </p>
      {sos.resolveReason && (
        <p className="rounded-xl bg-muted p-3 text-sm">
          <span className="text-muted-foreground">Reason: </span>
          {sos.resolveReason}
        </p>
      )}
    </Panel>
  )
}

type SosDetailViewProps = { id: string }

// One request: where it stands, what it says, the volunteer on it, and (while it is open) the things
// the victim can do: edit it (text, location, photos) and close it with a reason.
export function SosDetailView({ id }: SosDetailViewProps) {
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus)
  const { data: sos } = useSosQuery(id, poll)
  const resolve = useResolveSos(id)

  const [editing, setEditing] = useState(false)
  const [closing, setClosing] = useState(false)
  const [reason, setReason] = useState('')

  // The server page loaded it, so it is in the cache; this only guards the type.
  if (!sos) return null

  const open = !isSosFinished(sos.status)
  const reasonValid = resolveReasonSchema.safeParse(reason).success

  function confirmClose() {
    resolve.mutate(reason, {
      onSuccess: () => {
        setClosing(false)
        setReason('')
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: '/dashboard/sos', label: 'My requests' }}
        title={sos.address || 'SOS request'}
        description={`Raised ${formatRelativeTime(sos.createdAt)}`}
        actions={
          open && (
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
              <Button
                type="button"
                variant="destructive"
                className="h-11 gap-2 px-4"
                onClick={() => setClosing(true)}
              >
                <XCircle aria-hidden="true" />
                Close request
              </Button>
            </>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="sos" status={sos.status} />
        <PriorityBadge priority={sos.priority} />
      </div>

      <SosProgress status={sos.status} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
          {sos.task?.status === TaskStatus.COMPLETED && (
            <RateVolunteer
              sosId={sos.id}
              task={sos.task}
              volunteerName={sos.assignedVolunteer?.name ?? 'your volunteer'}
            />
          )}

          {/* Before a volunteer takes the request there is nobody to talk to, so a short note
              stands in and nothing is fetched. Once someone has been on it, the conversation stays
              readable after the request ends. */}
          {sos.assignedVolunteer || !open ? (
            <ChatPanel
              sosId={sos.id}
              live={Boolean(sos.assignedVolunteer) && open}
              closedNote={
                open
                  ? 'Messages open when a volunteer takes your request.'
                  : 'This request has ended, so the conversation is closed.'
              }
            />
          ) : (
            <Panel title="Messages">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MessageSquare aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                You can write to the volunteer here as soon as one takes your request.
              </p>
            </Panel>
          )}

          <Panel title="What you asked for">
            <ReliefBadges categories={sos.needs} />
            <RequestedSkills skills={sos.requiredSkills} />
            {sos.description ? (
              <p className="text-pretty whitespace-pre-line">{sos.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No extra details.</p>
            )}
          </Panel>

          <Panel title="Photos and videos">
            {sos.media.length > 0 ? (
              <SosMedia media={sos.media} />
            ) : (
              <p className="text-sm text-muted-foreground">Nothing attached.</p>
            )}
          </Panel>

          {!open && sos.resolvedAt && <ResolvePanel sos={sos} />}
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Volunteer">
            {sos.assignedVolunteer ? (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-2 font-medium">
                  <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
                  {sos.assignedVolunteer.name}
                </p>
                <a
                  href={`tel:${sos.assignedVolunteer.phone}`}
                  className="flex min-h-11 w-fit items-center gap-2 rounded-md text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Phone aria-hidden="true" className="size-4" />
                  {sos.assignedVolunteer.phone}
                </a>
              </div>
            ) : (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Siren aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                No volunteer has taken this yet. Volunteers nearby can see it, and this page updates
                on its own.
              </p>
            )}
          </Panel>

          <SosLocationPanel sos={sos} />
        </div>
      </div>

      {editing && <EditSosSheet sos={sos} open onOpenChange={setEditing} />}

      <ConfirmDialog
        open={closing}
        onOpenChange={(next) => {
          if (!resolve.isPending) setClosing(next)
        }}
        title="Close this request?"
        description="Volunteers will stop seeing it, and the volunteer on it will be told. You cannot reopen it, but you can always raise a new one."
        confirmLabel="Close request"
        cancelLabel="Keep it open"
        pending={resolve.isPending}
        confirmDisabled={!reasonValid}
        onConfirm={confirmClose}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="resolve-reason" className="text-sm font-medium">
            Why are you closing it?
          </label>
          <textarea
            id="resolve-reason"
            value={reason}
            rows={3}
            maxLength={SOS_RESOLVE_REASON_MAX_LENGTH}
            onChange={(event) => setReason(event.target.value)}
            placeholder="For example: help reached us, or we moved to a camp."
            className="min-h-20 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
