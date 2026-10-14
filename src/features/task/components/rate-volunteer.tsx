'use client'

import { CircleCheck, Loader2, Star, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/api/errors'
import { RATING_MAX } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { SosTaskSummary } from '@/types'
import { useRateTask } from '../task.queries'

const STARS = Array.from({ length: RATING_MAX }, (_, index) => index + 1)

const SCORE_WORD: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

type RateVolunteerProps = {
  sosId: string
  task: SosTaskSummary
  volunteerName: string
}

// Shown to the victim once the volunteer has finished the task: one to five whole stars, given once.
// The numbers of the volunteer (average, count) are updated by the backend in the same step.
export function RateVolunteer({ sosId, task, volunteerName }: RateVolunteerProps) {
  const rate = useRateTask(sosId)
  const [score, setScore] = useState(0)

  if (task.isRated) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success-soft p-4 sm:p-5">
        <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">You rated {volunteerName}</h2>
          <p className="text-sm">Thank you. A rating can be given once and cannot be changed.</p>
        </div>
      </section>
    )
  }

  if (!task.canRate) return null

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (score > 0) rate.mutate({ taskId: task.id, score })
      }}
      className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-sidebar-accent p-4 sm:p-5"
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="flex flex-col gap-1">
          <span className="text-base font-semibold">How was {volunteerName}'s help?</span>
          <span className="text-sm font-normal text-muted-foreground">
            Your rating is added to their reliability score. You can rate once.
          </span>
        </legend>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1">
            {STARS.map((value) => (
              <label
                key={value}
                className="grid size-11 cursor-pointer place-items-center rounded-lg has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
              >
                <input
                  type="radio"
                  name={`rating-${task.id}`}
                  value={value}
                  checked={score === value}
                  onChange={() => setScore(value)}
                  className="sr-only"
                />
                <Star
                  aria-hidden="true"
                  className={cn(
                    'size-8 transition-colors',
                    value <= score ? 'fill-warning text-warning' : 'text-muted-foreground',
                  )}
                />
                <span className="sr-only">
                  {value} {value === 1 ? 'star' : 'stars'}, {SCORE_WORD[value]}
                </span>
              </label>
            ))}
          </div>
          <p aria-live="polite" className="text-sm font-medium">
            {score > 0
              ? `${score} of ${RATING_MAX}: ${SCORE_WORD[score]}`
              : 'Choose a number of stars'}
          </p>
        </div>
      </fieldset>

      {rate.isError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {getErrorMessage(rate.error)}
        </p>
      )}

      <Button type="submit" className="h-11 w-fit px-6" disabled={score === 0 || rate.isPending}>
        {rate.isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
        Send rating
      </Button>
    </form>
  )
}
