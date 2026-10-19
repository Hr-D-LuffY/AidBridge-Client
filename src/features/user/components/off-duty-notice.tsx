import { Moon } from 'lucide-react'
import Link from 'next/link'
import type { UserProfile } from '@/types'
import { DutyChoices } from './duty-choices'
import { DutyBadge, describeDuty } from './duty-status'

type OffDutyNoticeProps = {
  profile: UserProfile
  // The overview offers the quick duty choices on the spot; other pages link to the profile.
  withChoices?: boolean
}

// Shown to a volunteer who is off duty (switched off, or past their duty time). Nothing when on duty.
// Off duty never stops them: they can still browse and take requests themselves.
export function OffDutyNotice({ profile, withChoices = false }: OffDutyNoticeProps) {
  if (profile.isOnDuty) return null

  return (
    <section
      aria-label="Duty"
      className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning-soft p-3 text-sm"
    >
      <div className="flex items-start gap-2">
        <Moon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <DutyBadge isOnDuty={false} />
            <span className="font-medium">{describeDuty(profile)}</span>
          </div>
          <p>
            Administrators and NGOs see you as unavailable. You can still browse and take requests
            yourself.
            {!withChoices && (
              <>
                {' '}
                <Link
                  href="/volunteer/profile"
                  className="font-medium text-link underline-offset-4 hover:underline"
                >
                  Go on duty in your profile
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </div>
      {withChoices && <DutyChoices profile={profile} />}
    </section>
  )
}
