'use client'

import { CheckCheck, Navigation, PackageOpen, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { HandOutSheet } from '@/features/distribution/components/hand-out-sheet'
import { useRejectSos } from '@/features/sos/sos.queries'
import { type FullTask, TaskStatus } from '@/types'
import { useUpdateTaskStatus } from '../task.queries'

type Step = 'set-off' | 'complete' | 'back-out'

type TaskActionsProps = {
  task: FullTask
  // Runs after the volunteer backed out (the task's own page goes back to the list).
  onBackedOut?: () => void
}

// What the volunteer can do next on a task that is being worked. Every step that tells the victim
// something, or cannot be taken back, asks first: setting off (after it they can no longer back out),
// finishing, and backing out. Handing out aid works at any point while the task is active.
export function TaskActions({ task, onBackedOut }: TaskActionsProps) {
  const update = useUpdateTaskStatus()
  const reject = useRejectSos()
  const [asking, setAsking] = useState<Step | null>(null)
  const [handingOut, setHandingOut] = useState(false)

  const accepted = task.status === TaskStatus.ACCEPTED
  const onTheWay = task.status === TaskStatus.ON_THE_WAY
  if (!accepted && !onTheWay) return null

  const pending = update.isPending || reject.isPending
  const name = task.sosRequest.victim.name

  function setStatus(status: typeof TaskStatus.ON_THE_WAY | typeof TaskStatus.COMPLETED) {
    update.mutate({ taskId: task.id, status }, { onSettled: () => setAsking(null) })
  }

  function backOut() {
    reject.mutate(task.sosRequest.id, {
      onSuccess: () => onBackedOut?.(),
      onSettled: () => setAsking(null),
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {accepted && (
          <Button
            type="button"
            className="h-11 gap-2 px-5"
            disabled={pending}
            onClick={() => setAsking('set-off')}
          >
            <Navigation aria-hidden="true" />I am on my way
          </Button>
        )}
        {onTheWay && (
          <Button
            type="button"
            className="h-11 gap-2 px-5"
            disabled={pending}
            onClick={() => setAsking('complete')}
          >
            <CheckCheck aria-hidden="true" />
            Mark as completed
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={pending}
          onClick={() => setHandingOut(true)}
        >
          <PackageOpen aria-hidden="true" />
          Hand out aid
        </Button>
        {accepted && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 gap-2 px-4"
            disabled={pending}
            onClick={() => setAsking('back-out')}
          >
            <Undo2 aria-hidden="true" />
            Back out
          </Button>
        )}
      </div>

      <ConfirmDialog
        tone="neutral"
        open={asking === 'set-off'}
        onOpenChange={(next) => {
          if (!update.isPending) setAsking(next ? 'set-off' : null)
        }}
        title="Are you setting off now?"
        description={`${name} is told that help is on the way. After this you can no longer back out of the request.`}
        confirmLabel="Yes, I am on my way"
        cancelLabel="Not yet"
        pending={update.isPending}
        onConfirm={() => setStatus(TaskStatus.ON_THE_WAY)}
      />

      <ConfirmDialog
        tone="neutral"
        open={asking === 'complete'}
        onOpenChange={(next) => {
          if (!update.isPending) setAsking(next ? 'complete' : null)
        }}
        title="Is the rescue done?"
        description={`The request is marked as rescued and ${name} is asked to rate you. You cannot undo this.`}
        confirmLabel="Yes, it is done"
        cancelLabel="Not yet"
        pending={update.isPending}
        onConfirm={() => setStatus(TaskStatus.COMPLETED)}
      />

      <ConfirmDialog
        open={asking === 'back-out'}
        onOpenChange={(next) => {
          if (!reject.isPending) setAsking(next ? 'back-out' : null)
        }}
        title="Back out of this request?"
        description={`The request goes back to waiting for other volunteers, and ${name} is no longer in your tasks. You cannot take it again.`}
        confirmLabel="Back out"
        cancelLabel="Stay on it"
        pending={reject.isPending}
        onConfirm={backOut}
      />

      {handingOut && (
        <HandOutSheet open onOpenChange={setHandingOut} tasks={[task]} taskId={task.id} />
      )}
    </>
  )
}
