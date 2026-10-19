'use client'

import {
  CirclePause,
  CirclePlay,
  Radar,
  Settings2,
  UserRoundMinus,
  UserRoundPlus,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type SosRequest, SosStatus } from '@/types'
import { usePauseDispatch, useRunDispatch, useUnassignSos } from '../dispatch.queries'
import { MAX_DISPATCH_NOTE_LENGTH } from '../dispatch.view'
import { AssignSheet } from './assign-sheet'

const WARNING = 'bg-warning-soft text-warning'
const DANGER = 'bg-destructive-soft text-destructive'
const INFO = 'bg-info-soft text-info'
const NEUTRAL = 'bg-muted text-muted-foreground'

function StateBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className={cn('h-6 px-2.5', tone)}>
      {children}
    </Badge>
  )
}

// Where the engine is with the request, in words: paused, nobody found, priority raised, rounds so far, and
// when it looks next. Only meaningful while the request is waiting for a volunteer.
function DispatchState({ sos }: { sos: SosRequest }) {
  const state = sos.dispatch
  if (!state) return null
  const waiting = sos.status === SosStatus.PENDING
  const due = state.nextActionAt ? Date.parse(state.nextActionAt) <= Date.now() : false

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {state.paused && <StateBadge tone={WARNING}>Automatic dispatch paused</StateBadge>}
        {state.unserved && <StateBadge tone={DANGER}>No volunteer found yet</StateBadge>}
        {state.priorityBumped && <StateBadge tone={INFO}>Priority raised by dispatch</StateBadge>}
        {state.level > 0 && (
          <StateBadge tone={NEUTRAL}>
            Search widened {state.level} {state.level === 1 ? 'time' : 'times'}
          </StateBadge>
        )}
      </div>
      {waiting && !state.paused && state.nextActionAt && (
        <p className="text-sm text-muted-foreground">
          {due
            ? 'The engine will look at this request on its next pass (about once a minute).'
            : `The engine looks at this request next ${formatRelativeTime(state.nextActionAt)}.`}
        </p>
      )}
      {waiting && state.paused && (
        <p className="text-sm text-muted-foreground">
          No offers are sent automatically. You can still offer or assign by hand.
        </p>
      )}
    </div>
  )
}

type Pending = 'run' | 'pause' | 'resume' | 'unassign' | null

// What an admin can do about who takes a request: choose a volunteer, run the engine now, pause it for this
// request, or take the request back from its volunteer. Every one of these touches real people, so each
// asks first and names the person and the request.
export function DispatchPanel({ sos }: { sos: SosRequest }) {
  const run = useRunDispatch(sos.id)
  const pause = usePauseDispatch(sos.id)
  const unassign = useUnassignSos(sos.id)
  const [assigning, setAssigning] = useState(false)
  const [confirming, setConfirming] = useState<Pending>(null)
  const [reason, setReason] = useState('')
  const [pauseAfter, setPauseAfter] = useState(false)

  const waiting = sos.status === SosStatus.PENDING
  const held = sos.status === SosStatus.ASSIGNED || sos.status === SosStatus.ON_THE_WAY
  // A finished request has nothing left to dispatch.
  if (!waiting && !held) return null

  const paused = sos.dispatch?.paused ?? false
  const volunteer = sos.assignedVolunteer?.name ?? 'the volunteer'
  const requestName = sos.address || `${sos.victim.name}'s request`
  const busy = run.isPending || pause.isPending || unassign.isPending

  function close() {
    setConfirming(null)
    setReason('')
    setPauseAfter(false)
  }

  function confirm() {
    if (confirming === 'run') run.mutate(undefined, { onSettled: close })
    else if (confirming === 'pause') pause.mutate(true, { onSettled: close })
    else if (confirming === 'resume') pause.mutate(false, { onSettled: close })
    else if (confirming === 'unassign') {
      const note = reason.trim()
      unassign.mutate(
        { ...(note && { reason: note }), ...(pauseAfter && { pause: true }) },
        { onSettled: close },
      )
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Dispatch</h2>
        <Link
          href="/admin/dispatch/settings"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Settings2 aria-hidden="true" className="size-4" />
          Settings
        </Link>
      </div>

      <DispatchState sos={sos} />

      {waiting && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-11 gap-2 px-4"
            disabled={busy}
            onClick={() => setAssigning(true)}
          >
            <UserRoundPlus aria-hidden="true" />
            Choose a volunteer
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 px-4"
            disabled={busy}
            onClick={() => setConfirming('run')}
          >
            <Zap aria-hidden="true" />
            Dispatch now
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 px-4"
            disabled={busy}
            onClick={() => setConfirming(paused ? 'resume' : 'pause')}
          >
            {paused ? <CirclePlay aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
            {paused ? 'Resume automatic dispatch' : 'Pause automatic dispatch'}
          </Button>
        </div>
      )}

      {held && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {volunteer} has this request. You can take it back if they cannot continue.
          </p>
          <div>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 px-4"
              disabled={busy}
              onClick={() => setConfirming('unassign')}
            >
              <UserRoundMinus aria-hidden="true" />
              Take back from {volunteer}
            </Button>
          </div>
        </div>
      )}

      {waiting && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Radar aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Choosing a volunteer sends an offer they can decline, or assigns the request to them at
          once.
        </p>
      )}

      <AssignSheet sos={sos} open={assigning} onOpenChange={setAssigning} />

      <ConfirmDialog
        open={confirming === 'run'}
        onOpenChange={(next) => {
          if (!busy && !next) close()
        }}
        title="Run dispatch for this request now?"
        description={`The engine skips the waiting time and asks the best volunteers near ${requestName} right away. They are notified.`}
        confirmLabel="Dispatch now"
        cancelLabel="Not now"
        tone="neutral"
        pending={run.isPending}
        onConfirm={confirm}
      />

      <ConfirmDialog
        open={confirming === 'pause'}
        onOpenChange={(next) => {
          if (!busy && !next) close()
        }}
        title="Pause automatic dispatch for this request?"
        description={`No offers for ${requestName} are sent automatically while it is paused, so ${sos.victim.name} may wait longer unless you choose a volunteer. You can resume at any time.`}
        confirmLabel="Pause dispatch"
        cancelLabel="Keep it running"
        pending={pause.isPending}
        onConfirm={confirm}
      />

      <ConfirmDialog
        open={confirming === 'resume'}
        onOpenChange={(next) => {
          if (!busy && !next) close()
        }}
        title="Resume automatic dispatch?"
        description={`The engine can offer ${requestName} to volunteers again on its next pass.`}
        confirmLabel="Resume dispatch"
        cancelLabel="Keep it paused"
        tone="neutral"
        pending={pause.isPending}
        onConfirm={confirm}
      />

      <ConfirmDialog
        open={confirming === 'unassign'}
        onOpenChange={(next) => {
          if (!busy && !next) close()
        }}
        title={`Take this request back from ${volunteer}?`}
        description={`${volunteer} is told their task was cancelled, and ${sos.victim.name} is told the volunteer cannot continue. The request goes back to waiting and is offered to others at once.`}
        confirmLabel="Take it back"
        cancelLabel="Keep the volunteer"
        pending={unassign.isPending}
        onConfirm={confirm}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="unassign-reason" className="text-sm font-medium">
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="unassign-reason"
              value={reason}
              rows={3}
              maxLength={MAX_DISPATCH_NOTE_LENGTH}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Shown to the volunteer, for example: they could not be reached."
              className="min-h-20 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            />
          </div>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={pauseAfter}
              onChange={(event) => setPauseAfter(event.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span>
              Pause automatic dispatch for this request, so the engine does not offer it to someone
              else before I choose.
            </span>
          </label>
        </div>
      </ConfirmDialog>
    </section>
  )
}
