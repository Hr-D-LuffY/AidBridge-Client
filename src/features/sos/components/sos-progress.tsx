import { Ban } from 'lucide-react'
import { StepProgress } from '@/components/shared/step-progress'
import { SosStatus } from '@/types'

const STEPS = [
  { key: SosStatus.PENDING, label: 'Request sent' },
  { key: SosStatus.ASSIGNED, label: 'Volunteer assigned' },
  { key: SosStatus.ON_THE_WAY, label: 'Help on the way' },
  { key: SosStatus.RESCUED, label: 'Rescued' },
] as const

// Where the request stands, as four steps (see StepProgress). A closed request stopped before the
// end, so it shows one line instead of steps.
export function SosProgress({ status }: { status: SosStatus }) {
  if (status === SosStatus.CLOSED) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm">
        <Ban aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        This request was closed. It is no longer visible to volunteers.
      </p>
    )
  }

  return (
    <StepProgress
      steps={STEPS}
      current={status}
      allDone={status === SosStatus.RESCUED}
      columnsClassName="grid-cols-2 sm:grid-cols-4"
    />
  )
}
