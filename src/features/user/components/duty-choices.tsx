'use client'

import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/types'
import { useUpdateProfile } from '../user.queries'
import { ErrorLine } from './error-line'

// Quick ways to go on duty. A number is hours from now (the backend allows up to 7 days); `null` means
// "until I switch off".
const DUTY_CHOICES: readonly { label: string; hours: number | null }[] = [
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
  { label: 'Until I switch off', hours: null },
]

const HOUR_MS = 60 * 60 * 1000

type DutyChoicesProps = {
  profile: Pick<UserProfile, 'isAvailable' | 'isOnDuty'>
}

// One tap sets how long the volunteer is on duty. Going on duty also turns availability on when it was
// off, in the same save, so there is never a second step. "Go off duty now" turns availability off.
export function DutyChoices({ profile }: DutyChoicesProps) {
  const update = useUpdateProfile('Duty updated.')

  function goOnDuty(hours: number | null) {
    update.mutate({
      onDutyUntil: hours === null ? null : new Date(Date.now() + hours * HOUR_MS).toISOString(),
      ...(!profile.isAvailable && { isAvailable: true }),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex min-w-0 flex-col gap-3" disabled={update.isPending}>
        <legend className="mb-3 text-sm font-medium">
          {profile.isOnDuty ? 'Change how long you are on duty' : 'Go on duty for'}
        </legend>
        <div className="flex flex-wrap gap-2">
          {DUTY_CHOICES.map((choice) => (
            <Button
              key={choice.label}
              type="button"
              variant="outline"
              className="h-11 px-4"
              disabled={update.isPending}
              onClick={() => goOnDuty(choice.hours)}
            >
              {choice.label}
            </Button>
          ))}
          {profile.isOnDuty && (
            <Button
              type="button"
              variant="secondary"
              className="h-11 px-4"
              disabled={update.isPending}
              onClick={() => update.mutate({ isAvailable: false })}
            >
              Go off duty now
            </Button>
          )}
        </div>
      </fieldset>
      {update.isError && <ErrorLine error={update.error} />}
    </div>
  )
}
