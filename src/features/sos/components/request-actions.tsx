'use client'

import { EyeOff, HandHeart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { useActiveTasksQuery } from '@/features/task/task.queries'
import { MAX_ACTIVE_TASKS } from '@/lib/constants'
import { useAcceptSos, useRejectSos } from '../sos.queries'

// The reason Accept is off, or null when it is on. Three tasks is the most a volunteer can hold; the
// backend is the authority (a 409), this only says so before the tap.
export function useAcceptBlock(): string | null {
  const { data: active } = useActiveTasksQuery()
  if (!active || active.length < MAX_ACTIVE_TASKS) return null
  return `You already have ${MAX_ACTIVE_TASKS} active tasks. Finish or back out of one to take another.`
}

type RequestActionsProps = {
  sosId: string
  // Runs after the request was declined (the detail page goes back to the list).
  onDeclined?: () => void
  className?: string
}

// "Accept" and "Decline" for a request that is still waiting for a volunteer. Accepting opens the new
// task (the phone number and exact location come with it); declining hides the request from this
// volunteer for good, so it asks first.
export function RequestActions({ sosId, onDeclined, className }: RequestActionsProps) {
  const router = useRouter()
  const accept = useAcceptSos()
  const reject = useRejectSos()
  const block = useAcceptBlock()
  const [declining, setDeclining] = useState(false)
  const busy = accept.isPending || reject.isPending

  function takeIt() {
    accept.mutate(sosId, {
      onSuccess: ({ task }) => router.push(`/volunteer/tasks/${task.id}`),
    })
  }

  function declineIt() {
    reject.mutate(sosId, {
      onSuccess: () => {
        setDeclining(false)
        onDeclined?.()
      },
    })
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="h-11 gap-2 px-5"
          disabled={busy || block !== null}
          onClick={takeIt}
        >
          <HandHeart aria-hidden="true" />
          {accept.isPending ? 'Accepting…' : 'Accept request'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={busy}
          onClick={() => setDeclining(true)}
        >
          <EyeOff aria-hidden="true" />
          Decline
        </Button>
      </div>
      {block && <p className="mt-2 text-sm text-muted-foreground">{block}</p>}

      <ConfirmDialog
        open={declining}
        onOpenChange={(next) => {
          if (!reject.isPending) setDeclining(next)
        }}
        title="Hide this request?"
        description="It disappears from your list and you will not see it again. Other volunteers can still take it."
        confirmLabel="Hide request"
        cancelLabel="Keep it"
        pending={reject.isPending}
        onConfirm={declineIt}
      />
    </div>
  )
}
