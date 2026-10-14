import { Ban, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SosStatus } from '@/types'

const STEPS = [
  { status: SosStatus.PENDING, label: 'Request sent' },
  { status: SosStatus.ASSIGNED, label: 'Volunteer assigned' },
  { status: SosStatus.ON_THE_WAY, label: 'Help on the way' },
  { status: SosStatus.RESCUED, label: 'Rescued' },
] as const

// Where the request stands, as four steps. The finished steps carry a tick and the current one is
// named for screen readers (aria-current), so the meaning is never colour alone. A closed request
// stopped before the end, so it shows one line instead of steps.
export function SosProgress({ status }: { status: SosStatus }) {
  if (status === SosStatus.CLOSED) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm">
        <Ban aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        This request was closed. It is no longer visible to volunteers.
      </p>
    )
  }

  const current = STEPS.findIndex((step) => step.status === status)

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STEPS.map((step, index) => {
        const done = index < current || status === SosStatus.RESCUED
        const active = index === current
        return (
          <li
            key={step.status}
            aria-current={active ? 'step' : undefined}
            className="flex flex-col gap-2"
          >
            <span
              className={cn('h-1.5 rounded-full', done || active ? 'bg-primary' : 'bg-muted')}
            />
            <span className="flex items-center gap-1.5 text-sm">
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold',
                  done
                    ? 'bg-primary text-primary-foreground'
                    : active
                      ? 'border-2 border-primary text-primary'
                      : 'border text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3" /> : index + 1}
              </span>
              <span className={cn(active ? 'font-semibold' : 'text-muted-foreground')}>
                {step.label}
                {done && <span className="sr-only"> (done)</span>}
                {active && <span className="sr-only"> (current step)</span>}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
