import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Step<T extends string> = { key: T; label: string }

type StepProgressProps<T extends string> = {
  steps: readonly Step<T>[]
  // The step the work is at now.
  current: T
  // Every step is finished (the last one included), so all of them carry a tick.
  allDone?: boolean
  // How the steps sit in the grid ("grid-cols-3").
  columnsClassName: string
}

// Where something stands, as numbered steps. The finished steps carry a tick and the current one is
// named for screen readers (aria-current), so the meaning is never colour alone. Plain markup with no
// hooks. Used for a request (4 steps) and for a volunteer's task (3).
export function StepProgress<T extends string>({
  steps,
  current,
  allDone = false,
  columnsClassName,
}: StepProgressProps<T>) {
  const currentIndex = steps.findIndex((step) => step.key === current)

  return (
    <ol className={cn('grid gap-3', columnsClassName)}>
      {steps.map((step, index) => {
        const done = index < currentIndex || allDone
        const active = index === currentIndex
        return (
          <li
            key={step.key}
            aria-current={active && !allDone ? 'step' : undefined}
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
                {active && !allDone && <span className="sr-only"> (current step)</span>}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
