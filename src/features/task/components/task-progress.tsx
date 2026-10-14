import { Ban } from 'lucide-react'
import { StepProgress } from '@/components/shared/step-progress'
import { TaskStatus } from '@/types'

const STEPS = [
  { key: TaskStatus.ACCEPTED, label: 'Accepted' },
  { key: TaskStatus.ON_THE_WAY, label: 'On the way' },
  { key: TaskStatus.COMPLETED, label: 'Completed' },
] as const

// Where the volunteer's task stands, as three steps (see StepProgress). A task that was declined or
// cancelled stopped before the end, so it says so in one line.
export function TaskProgress({ status }: { status: TaskStatus }) {
  if (status === TaskStatus.REJECTED || status === TaskStatus.CANCELLED) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm">
        <Ban aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        {status === TaskStatus.REJECTED
          ? 'You are no longer on this request.'
          : 'This task was cancelled.'}
      </p>
    )
  }

  return (
    <StepProgress
      steps={STEPS}
      current={status === TaskStatus.PENDING ? TaskStatus.ACCEPTED : status}
      allDone={status === TaskStatus.COMPLETED}
      columnsClassName="grid-cols-3"
    />
  )
}
